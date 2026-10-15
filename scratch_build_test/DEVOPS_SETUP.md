# Production-Ready DevOps Setup: React App on Azure

This repository contains a complete CI/CD pipeline with Infrastructure-as-Code (Terraform) for deploying a React application on Microsoft Azure using GitHub Actions.

---

## 📋 Project Overview

This DevOps setup provides:
- **Infrastructure as Code**: Terraform configuration for Azure resources
- **CI Pipeline**: Automated build, test, and security scanning
- **CD Pipeline**: Automated deployment to Azure Web App
- **Security**: CodeQL static analysis and best practices

### Technology Stack
- **Framework**: React 18+
- **Infrastructure**: Microsoft Azure
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **Security Scanning**: GitHub CodeQL

---

## 🏗️ Project Structure

```
.
├── azure/                          # Terraform infrastructure
│   ├── main.tf                     # Azure resources (App Service, Web App)
│   ├── variables.tf                # Input variables and validation
│   └── outputs.tf                  # Output values (URLs, IDs)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Build, test, and security scan pipeline
│       └── cd.yml                  # Deployment pipeline
│
├── security/                       # Security policies and configurations
│
├── src/                            # React application source code
├── public/                         # Static assets
├── package.json                    # Node.js dependencies
└── README.md                       # This file
```

---

## 🔧 Prerequisites

Before setting up this pipeline, ensure you have:

1. **GitHub Repository**: Your code pushed to GitHub
2. **Azure Account**: Active Azure subscription
3. **Azure CLI**: Installed locally for Terraform state management
4. **Terraform**: Version 1.0+ installed locally (optional, for local development)

---

## 🚀 Setup Instructions

### Step 1: Add Azure Secrets to GitHub

Navigate to your GitHub repository settings and add these secrets under **Settings → Secrets and variables → Actions**:

| Secret Name | Description | How to Get |
|------------|-------------|-----------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Azure Web App publish credentials | Download from Azure Portal → Web App → Get publish profile |
| `AZURE_CLIENT_ID` | Azure Service Principal ID | `az ad sp create-for-rbac` output |
| `AZURE_CLIENT_SECRET` | Azure Service Principal Secret | `az ad sp create-for-rbac` output |
| `AZURE_TENANT_ID` | Azure Tenant ID | `az account show --query tenantId` |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | `az account show --query id` |

### Creating Azure Service Principal

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac \
  --name "github-devops" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID}

# Copy the output values to GitHub Secrets
```

### Step 2: Deploy Infrastructure with Terraform

```bash
# Navigate to azure directory
cd azure

# Initialize Terraform
terraform init

# Plan the deployment (preview changes)
terraform plan -out=tfplan

# Apply the configuration (create resources)
terraform apply tfplan
```

### Step 3: Configure Application

Update the deployment variables in `.github/workflows/cd.yml`:
- `AZURE_WEBAPP_NAME`: Your Azure Web App name
- `AZURE_RESOURCE_GROUP`: Your resource group name

---

## 📊 Pipeline Architecture

### CI Pipeline Workflow (ci.yml)

```
Trigger: Push to main/develop or Pull Request
  ↓
├─ Job: Build and Test
│  ├─ Checkout code
│  ├─ Setup Node.js 18
│  ├─ Restore npm cache
│  ├─ Install dependencies (npm ci)
│  ├─ Lint code (ESLint)
│  ├─ Run tests
│  ├─ Build React app
│  └─ Upload build artifact
│
└─ Job: Code Quality & Security
   ├─ Initialize CodeQL
   ├─ Run JavaScript analysis
   └─ Upload SARIF results
```

**Duration**: ~5-10 minutes

### CD Pipeline Workflow (cd.yml)

```
Trigger: After successful CI pipeline on main branch
  ↓
├─ Job: Deploy
│  ├─ Checkout code
│  ├─ Download build artifact
│  ├─ Deploy to Azure Web App
│  └─ Log deployment success
│
└─ Job: Notification
   ├─ Check deployment status
   └─ Send notification
```

**Duration**: ~2-3 minutes

---

## 📝 Line-by-Line Explanation

### CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline                           # Workflow name (appears in GitHub Actions)

on:
  push:
    branches:
      - main
      - develop                             # Trigger on push to these branches
  pull_request:
    branches:
      - main
      - develop                             # Also trigger on pull requests
```

**Why this way?**
- Runs on every push to ensure code quality
- Also runs on PRs for review before merging

```yaml
env:
  NODE_VERSION: "18"                        # Set Node.js version globally
```

**Why this way?**
- Centralized version management
- Easy to update React dependencies versions

```yaml
jobs:
  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest                  # Use latest Ubuntu runner
```

**Why this way?**
- `ubuntu-latest` is cost-effective and sufficient for Node.js apps
- Using specific version ensures consistency

```yaml
      - name: Install dependencies
        run: npm ci                         # Clean install (better than npm install)
```

**Why `npm ci` instead of `npm install`?**
- `npm ci` respects `package-lock.json` exactly
- Ensures reproducible builds across environments
- Fails if dependencies are incompatible

```yaml
      - name: Run unit tests
        run: npm test -- --watchAll=false --coverage
```

**Why this way?**
- `--watchAll=false`: CI doesn't need watch mode
- `--coverage`: Generates test coverage report

```yaml
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

**Why GitHub CodeQL?**
- Free security scanning for JavaScript
- Catches vulnerabilities automatically
- Integrates with GitHub Security tab

### CD Pipeline (`.github/workflows/cd.yml`)

```yaml
on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types:
      - completed                           # Waits for CI to finish
    branches:
      - main                                # Only deploy main branch
```

**Why this way?**
- Prevents failed builds from being deployed
- Only deploys production-ready code (main branch)

```yaml
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
```

**Why this condition?**
- Double-checks CI success before deploying
- Prevents rollout of broken code

```yaml
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

**Why this way?**
- Official Microsoft action for Azure
- Uses publish profile (secure credential storage)
- Secrets are never logged

### Terraform (azure/main.tf)

```hcl
resource "azurerm_resource_group" "rg" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location
```

**Why naming convention?**
- `{project}-{environment}-{resource}` makes resources identifiable
- Follows Azure best practices
- Prevents name collisions

```hcl
  tags = {
    Environment = var.environment
    Project     = var.project_name
    Owner       = var.owner
    ManagedBy   = "Terraform"
  }
```

**Why tags?**
- Track costs per project/environment
- Identify resources managed by Terraform
- Simplify governance and compliance

```hcl
resource "azurerm_app_service_plan" "plan" {
  os_type             = "Linux"
  sku_name            = var.app_service_sku    # B1, B2, etc.
```

**Why Linux?**
- Better support for Node.js
- More cost-effective than Windows
- B1 is recommended for small production apps

```hcl
resource "azurerm_linux_web_app_slot" "staging" {
  name = "staging"
```

**Why staging slot?**
- Allows testing before production deployment
- Zero-downtime deployments
- Easy rollback if issues occur

---

## 🔒 Security Best Practices

1. **Secrets Management**:
   - Never commit secrets to Git
   - Use GitHub Secrets for sensitive data
   - Rotate credentials monthly

2. **CodeQL Analysis**:
   - Automatically scans for vulnerabilities
   - Blocks deployment if high-severity issues found
   - Integrates with GitHub Security tab

3. **Infrastructure as Code**:
   - All resources defined in Terraform
   - Auditable and version-controlled
   - Easy to replicate environments

4. **Network Security**:
   - Use HTTPS only
   - Configure Azure WAF for additional protection
   - Restrict access by IP if needed

---

## 🧪 Testing the Pipeline

### Test CI Pipeline
```bash
# Push to a feature branch
git checkout -b test/devops
git add .
git commit -m "Add DevOps setup"
git push origin test/devops

# Open a pull request on GitHub
# Watch CI pipeline run in Actions tab
```

### Test CD Pipeline
```bash
# Push to main
git checkout main
git merge test/devops
git push origin main

# CD pipeline triggers automatically after CI completes
# Monitor in GitHub Actions → CD Pipeline
```

### Verify Azure Deployment
```bash
# Check Web App status
az webapp show --name insurance-portal-prod-app \
  --resource-group insurance-portal-prod-rg

# Get app URL
az webapp show --name insurance-portal-prod-app \
  --resource-group insurance-portal-prod-rg \
  --query "defaultHostName"
```

---

## 📈 Monitoring & Logs

### GitHub Actions Logs
1. Go to your repository
2. Click **Actions** tab
3. Select a workflow run
4. View logs for each step

### Azure Monitor
1. Go to Azure Portal
2. Navigate to your App Service
3. Check **Logs** and **Metrics** sections

### Application Insights (Optional)
```bash
# Add Application Insights for advanced monitoring
az monitor app-insights component create \
  --app your-app-name \
  --location eastus \
  --resource-group your-resource-group
```

---

## 🆘 Troubleshooting

### Issue: "Publish profile not found"
**Solution**: 
```bash
# Download from Azure Portal
# App Service → Get Publish Profile → Save → Add to GitHub Secrets
```

### Issue: "npm ci fails in pipeline"
**Solution**:
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add lock file"
git push
```

### Issue: "Deployment timeout"
**Solution**:
- Check Azure App Service logs
- Ensure build artifact is not too large (>1GB)
- Increase timeout in cd.yml

---

## 🎯 Next Steps

1. **Configure Alerts**: Set up GitHub branch protection rules
2. **Add Slack Notifications**: Use `slackapi/slack-github-action`
3. **Cost Optimization**: Review Azure SKU recommendations monthly
4. **Disaster Recovery**: Configure backup and restore policies
5. **Team Onboarding**: Document secrets setup for new team members

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest)
- [GitHub CodeQL](https://codeql.github.com/)

---

## 📞 Support

For issues or questions:
1. Check GitHub Actions logs
2. Review Azure Portal diagnostics
3. Verify all secrets are set correctly
4. Ensure Terraform state is properly configured

---

**Generated**: April 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
