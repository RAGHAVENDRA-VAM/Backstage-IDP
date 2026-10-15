# General settings
subscription_id         = "5cfc3711-feee-4022-9437-8ccc5e78073e"
resource_group          = "IDP-rg"
resource_group_location = "Central India"
environment             = "Testing"

# Virtual Machine settings
virtual_machine_instance_count       = 1
virtual_machine_vnet_name            = "demovnet"
virtual_machine_vnet_address_space   = ["10.0.0.0/16"]
virtual_machine_subnet_name          = "subnet"
virtual_machine_subnet_address_space = ["10.0.1.0/24"]
virtual_machine_name                = "testvm"
virtual_machine_size                = "Standard_D4s_v3"

# SQL Database settings
sql_server_name           = "sqlser234509"
sql_server_admin_username = "sqladm234509"
sql_server_admin_password = "P@ss1234567890"
sql_db_name               = "sqldb1"
sql_db_sku                = "Basic"

# Web App settings
webapp_name    = "webapp6327"
webapp_envs    = ["dev", "uat", "prod"]
webapp_os_type = "Linux"
webapp_sku     = "B1"
webapp_repo_url = "https://github.com/Azure-Samples/dotnetcore-docs-hello-world"

# Storage Account settings
storage_account_name      = "mystorageac6327"
storage_account_tier      = "Premium"
storage_account_replication_type = "LRS"

# Key Vault settings
key_vault_name        = "mykeyvault6327"
key_vault_sku         = "standard"
key_vault_key_permissions    = ["List", "Create", "Delete", "Get", "Purge", "Recover", "Update", "GetRotationPolicy", "SetRotationPolicy"]
key_vault_secret_permissions = ["Set"]
