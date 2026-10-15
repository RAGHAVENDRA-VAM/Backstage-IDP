terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "${{ values.name }}-rg"
  location = "${{ values.location }}"
  
  tags = {
    ManagedBy   = "Backstage"
    Environment = "Development"
  }
}

resource "azurerm_service_plan" "app_plan" {
  name                = "${{ values.name }}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "${{ values.os }}"
  sku_name            = "${{ values.pricingTier }}"
}

{% if values.os == 'Linux' %}
resource "azurerm_linux_web_app" "web_app" {
  name                = "${{ values.name }}-webapp"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
    application_stack {
{% if values.runtimeStack == 'node_24' %}      node_version = "20-lts"
{% elif values.runtimeStack == 'node_22' %}      node_version = "20-lts"
{% elif values.runtimeStack == 'python_312' %}      python_version = "3.12"
{% elif values.runtimeStack == 'python_311' %}      python_version = "3.11"
{% elif values.runtimeStack == 'dotnet_8' %}      dotnet_version = "8.0"
{% elif values.runtimeStack == 'java_17' %}      java_version = "17"
{% elif values.runtimeStack == 'php_83' %}      php_version = "8.3"
{% else %}      node_version = "20-lts"
{% endif %}    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
  }
}
{% else %}
resource "azurerm_windows_web_app" "web_app" {
  name                = "${{ values.name }}-webapp"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.app_plan.id

  site_config {
    application_stack {
{% if values.runtimeStack == 'node_24' %}      node_version = "~20"
{% elif values.runtimeStack == 'node_22' %}      node_version = "~20"
{% elif values.runtimeStack == 'dotnet_8' %}      dotnet_version = "v8.0"
{% elif values.runtimeStack == 'java_17' %}      java_version = "17"
{% elif values.runtimeStack == 'php_83' %}      php_version = "8.3"
{% else %}      node_version = "~20"
{% endif %}    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
  }
}
{% endif %}
