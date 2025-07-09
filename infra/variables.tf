variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "eu-west-2"
}

variable "db_name" {
  description = "The name of the PostgreSQL database for initial creation."
  type        = string
  default     = "service_register_db"
}

variable "db_username" {
  description = "The username for the PostgreSQL database for initial creation."
  type        = string
  default     = "admin_user"
}

variable "image_tag" {
  description = "The image tag in ECR"
  type        = string
  default     = "latest"
}
