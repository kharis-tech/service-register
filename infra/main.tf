terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- Random Password Generation ---
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# --- Networking ---
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = { Name = "service-register-vpc" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  tags              = { Name = "service-register-private-a" }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}b"
  tags              = { Name = "service-register-private-b" }
}

# --- Security Groups (Definitions) ---
resource "aws_security_group" "vpc_endpoint_sg" {
  name        = "service-register-vpc-endpoint-sg"
  description = "Allow traffic to VPC endpoints"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "service-register-vpc-endpoint-sg" }
}

resource "aws_security_group" "fargate_sg" {
  name        = "service-register-fargate-sg"
  description = "Allow traffic to the Fargate service"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "service-register-fargate-sg" }
}

resource "aws_security_group" "db_sg" {
  name        = "service-register-db-sg"
  description = "Allow traffic to the RDS instance"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "service-register-db-sg" }
}

resource "aws_security_group" "lambda_sg" {
  name        = "service-register-lambda-sg"
  description = "Security group for the Lambda proxy"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "service-register-lambda-sg" }
}

# --- Security Group Rules (Decoupled to prevent cycles) ---

# VPC Endpoint SG Rules (Ingress)
resource "aws_security_group_rule" "vpc_endpoint_ingress_from_fargate" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.fargate_sg.id
  security_group_id        = aws_security_group.vpc_endpoint_sg.id
  description              = "Allow HTTPS from Fargate"
}

resource "aws_security_group_rule" "vpc_endpoint_ingress_from_lambda" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.lambda_sg.id
  security_group_id        = aws_security_group.vpc_endpoint_sg.id
  description              = "Allow HTTPS from Lambda"
}

# Fargate SG Rules (Ingress)
resource "aws_security_group_rule" "fargate_ingress_from_lambda" {
  type                     = "ingress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.lambda_sg.id
  security_group_id        = aws_security_group.fargate_sg.id
  description              = "Allow traffic from Lambda"
}

# DB SG Rules (Ingress)
resource "aws_security_group_rule" "db_ingress_from_fargate" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.fargate_sg.id
  security_group_id        = aws_security_group.db_sg.id
  description              = "Allow Postgres traffic from Fargate"
}

# Generic Egress Rules (Stateful firewalls mean this is secure)
resource "aws_security_group_rule" "lambda_egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.lambda_sg.id
  description       = "Allow all outbound traffic"
}

resource "aws_security_group_rule" "fargate_egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.fargate_sg.id
  description       = "Allow all outbound traffic"
}

resource "aws_security_group_rule" "db_egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.db_sg.id
  description       = "Allow all outbound traffic"
}

resource "aws_security_group_rule" "vpc_endpoint_egress_all" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.vpc_endpoint_sg.id
  description       = "Allow all outbound traffic"
}


# --- Database ---
resource "aws_db_subnet_group" "default" {
  name       = "service-register-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = { Name = "Service Register DB Subnet Group" }
}

resource "aws_db_instance" "default" {
  identifier             = "service-register-db"
  engine                 = "postgres"
  engine_version         = "14"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db_password.result
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
}

# --- Secrets Manager ---
resource "aws_secretsmanager_secret" "database_url" {
  name = "service-register/database-server-url-string"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.default.address}:5432/${var.db_name}"
}


# --- ECR ---
resource "aws_ecr_repository" "service_register_repo" {
  name = "service-register-repo"
}

# --- IAM ---
data "aws_iam_policy_document" "ecs_task_execution_role_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "service-register-ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role_trust.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "service-register-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role_trust.json
}

resource "aws_iam_policy" "task_secrets_policy" {
  name = "service-register-task-secrets-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "secretsmanager:GetSecretValue"
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.database_url.arn
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "task_secrets_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.task_secrets_policy.arn
}

resource "aws_iam_role_policy_attachment" "task_execution_secrets_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.task_secrets_policy.arn
}

# --- Cloud Map ---
resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "service-register.local"
  vpc  = aws_vpc.main.id
}

resource "aws_service_discovery_service" "main" {
  name = "backend"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

# --- ECS / Fargate ---
resource "aws_cloudwatch_log_group" "service_register_logs" {
  name = "/ecs/service-register"
}

resource "aws_ecs_cluster" "main" {
  name = "service-register-cluster"
}

resource "aws_ecs_task_definition" "main" {
  family                   = "service-register-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "service-register-container"
      image     = "${aws_ecr_repository.service_register_repo.repository_url}:${var.image_tag}"
      essential = true
      portMappings = [{
        containerPort = 8000
        hostPort      = 8000
      }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.service_register_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "main" {
  name            = "service-register-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups = [aws_security_group.fargate_sg.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.main.arn
  }
}

# --- Lambda Proxy ---
resource "aws_iam_role" "lambda_proxy_role" {
  name = "service-register-lambda-proxy-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  role       = aws_iam_role.lambda_proxy_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_policy" "lambda_discover_policy" {
  name = "service-register-lambda-discover-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = "servicediscovery:DiscoverInstances"
      Effect   = "Allow"
      Resource = "*" # More specific ARN can be used here
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_discover" {
  role       = aws_iam_role.lambda_proxy_role.name
  policy_arn = aws_iam_policy.lambda_discover_policy.arn
}

resource "aws_lambda_function" "proxy" {
  filename         = "${path.root}/lambda_proxy.zip"
  function_name    = "service-register-proxy"
  role             = aws_iam_role.lambda_proxy_role.arn
  handler          = "main.handler"
  runtime          = "python3.10"
  timeout          = 15
  source_code_hash = filebase64sha256("${path.root}/lambda_proxy.zip")

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  environment {
    variables = {
      NAMESPACE_NAME = aws_service_discovery_private_dns_namespace.main.name
      SERVICE_NAME   = aws_service_discovery_service.main.name
    }
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.proxy.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}


# --- API Gateway ---
resource "aws_apigatewayv2_api" "main" {
  name          = "service-register-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "main" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.proxy.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default" # Catch-all route
  target    = "integrations/${aws_apigatewayv2_integration.main.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

# --- VPC Endpoints ---
resource "aws_vpc_endpoint" "secrets_manager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  tags                = { Name = "service-register-secrets-manager-endpoint" }
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  tags                = { Name = "service-register-ecr-api-endpoint" }
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  tags                = { Name = "service-register-ecr-dkr-endpoint" }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_vpc.main.main_route_table_id]
  tags              = { Name = "service-register-s3-gateway-endpoint" }
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.logs"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  tags                = { Name = "service-register-logs-endpoint" }
}

resource "aws_vpc_endpoint" "cloud_map" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.servicediscovery"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoint_sg.id]
  route_table_ids   = [aws_vpc.main.main_route_table_id]
  tags                = { Name = "service-register-cloud-map-endpoint" }
}
