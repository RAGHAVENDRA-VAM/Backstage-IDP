output "web_app_name" {
  description = "The name of the deployed Azure Web App."
  value       = azurerm_linux_web_app.web_app.name
}

output "web_app_url" {
  description = "The URL of the deployed Azure Web App."
  value       = "https://${azurerm_linux_web_app.web_app.default_hostname}"
}

output "resource_group_name" {
  description = "The Resource Group containing the Web App."
  value       = azurerm_resource_group.rg.name
}