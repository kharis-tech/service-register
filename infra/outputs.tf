output "api_gateway_url" {
  description = "The URL of the API Gateway endpoint"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository"
  value       = aws_ecr_repository.service_register_repo.repository_url
}
