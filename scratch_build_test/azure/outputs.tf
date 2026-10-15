output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.rg.name
}

output "resource_group_id" {
  description = "ID of the resource group"
  value       = azurerm_resource_group.rg.id
}

output "app_service_plan_id" {
  description = "ID of the App Service Plan"
  value       = azurerm_service_plan.plan.id
}

output "web_app_id" {
  description = "ID of the Web App"
  value       = azurerm_linux_web_app.app.id
}

output "web_app_name" {
  description = "Name of the Web App"
  value       = azurerm_linux_web_app.app.name
}

output "web_app_default_hostname" {
  description = "Default hostname of the Web App"
  value       = azurerm_linux_web_app.app.default_hostname
}

output "web_app_publish_profile" {
  description = "Publish profile for deployment"
  value       = azurerm_linux_web_app.app.name
  sensitive   = false
}

output "staging_slot_hostname" {
  description = "Hostname of the staging slot"
  value       = azurerm_linux_web_app_slot.staging.default_hostname
}

output "app_url" {
  description = "URL of the deployed application"
  value       = "https://${azurerm_linux_web_app.app.default_hostname}"
}
