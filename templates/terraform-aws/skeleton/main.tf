provider "aws" {
  region = var.aws_region
}

# Example S3 Bucket provisioning
resource "aws_s3_bucket" "example_bucket" {
  bucket = "${{ values.name }}-bucket"

  tags = {
    Name        = "${{ values.name }}"
    Environment = "Dev"
    Description = "${{ values.description }}"
  }
}
