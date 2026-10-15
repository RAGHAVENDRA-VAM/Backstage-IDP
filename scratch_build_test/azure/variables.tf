variable "project_name" {
  description = "Project name"
  type        = string
  default     = "insurance-portal"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "app_service_sku" {
  description = "App Service Plan SKU (B1, B2, F1, etc.)"
  type        = string
  default     = "B1"
  
  validation {
    condition     = contains(["F1", "B1", "B2", "B3", "S1", "S2", "S3"], var.app_service_sku)
    error_message = "Invalid SKU. Use F1, B1, B2, B3, S1, S2, or S3."
  }
}

variable "owner" {
  description = "Owner name for tagging"
  type        = string
  default     = "DevOps Team"
}
