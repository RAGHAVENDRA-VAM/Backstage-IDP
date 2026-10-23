#  Enterprise Internal Developer Platform (IDP)

[![Azure Web Apps](https://img.shields.io/badge/Azure%20App%20Service-Deployed-0078D4?logo=microsoftazure)](https://backstage-idp-gvftaxetancteec5.westus3-01.azurewebsites.net)
[![Backstage](https://img.shields.io/badge/Backstage-v1.36.0-white?logo=backstage&logoColor=005B4B)](https://backstage.io)
[![CI/CD](https://img.shields.io/badge/GitHub%20Actions-Automated%20Deploy-success?logo=githubactions)](https://github.com/RAGHAVENDRA-VAM/Backstage-IDP/actions)
[![SOC2 & ISO-27001](https://img.shields.io/badge/Compliance-SOC2%20%7C%20ISO--27001-blue)]()

Central developer portal and self-service engineering command center for Shield Insurance. Integrates software cataloging, automated scaffolding, Jira ticket management, GitHub CI/CD workflows, Microsoft Azure cloud architecture & FinOps cost governance, and Datadog APM observability.

---

##  Architecture Overview

```
                      +---------------------------------------+
                      |       GitHub Repository & Actions     |
                      |    (main branch push triggers CI/CD)  |
                      +-------------------+-------------------+
                                          |
                      +-------------------v-------------------+
                      |      Azure Container Registry (ACR)   |
                      |   Builds & tags multi-arch image      |
                      +-------------------+-------------------+
                                          |
                      +-------------------v-------------------+
                      |   Azure Web App for Containers (Linux)|
                      |   https://backstage-idp-...azure...   |
                      +-------------------+-------------------+
                                          |
            +-----------------------------+-----------------------------+
            |                             |                             |
  +---------v---------+         +---------v---------+         +---------v---------+
  |    Jira Cloud     |         |   GitHub OAuth    |         |   Azure ARM API   |
  | (Real-time issues |         | (SSO Authentication|         |  & FinOps Cost    |
  |   & SLA status)   |         |  & Team Mapping)  |         |  Management API)  |
  +-------------------+         +-------------------+         +-------------------+
            |                             |
  +---------v---------+         +---------v---------+
  |  Datadog APM US1  |         |  Software Catalog |
  | (Traces, monitors |         |  & Scaffolder     |
  |  & live telemetry)|         |  (Golden Paths)   |
  +-------------------+         +-------------------+
```

---

##  End-to-End Deployment Process

This application is containerized using Docker and deployed continuously to **Microsoft Azure App Service (Linux Containers)** via **GitHub Actions** and **Azure Container Registry (ACR)**.

### Step 1: Pre-Requisites & Cloud Resources

Ensure the following Azure and GitHub resources are provisioned:
1. **Azure Resource Group:** e.g., `devops-maf` in region `westus3`.
2. **Azure App Service Plan:** Linux B1/P1v3 or higher.
3. **Azure Web App for Containers:** Target App Service (e.g., `backstage-idp-gvftaxetancteec5`).
4. **Azure Container Registry (ACR):** Private registry holding production container images.
5. **Azure Service Principal / App Registration:** With `Contributor` + `Cost Management Reader` roles on the subscription.
6. **GitHub OAuth App:** Configured with production callback URL:
   `https://<app-name>.azurewebsites.net/api/auth/github/handler/frame`

---

### Step 2: GitHub Repository Secrets Configuration

In your GitHub repository (**Settings > Secrets and variables > Actions > Repository secrets**), configure:

| Secret Name | Description | Example / Source |
| :--- | :--- | :--- |
| `ACR_LOGIN_SERVER` | Azure Container Registry login endpoint | `myacrregistry.azurecr.io` |
| `ACR_USERNAME` | ACR admin username or Service Principal appId | `<acr-username>` |
| `ACR_PASSWORD` | ACR admin password or Service Principal secret | `<acr-password>` |
| `AZURE_WEBAPP_NAME` | Name of Azure App Service Web App | `backstage-idp-gvftaxetancteec5` |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | XML publish profile downloaded from Azure Portal | Portal > Web App > "Get publish profile" |

---

### Step 3: Azure App Service Environment Variables (App Settings)

In the Azure Portal (**App Service > Settings > Configuration / Environment variables**), set:

```env
# Port & Node Environment
PORT=7007
NODE_ENV=production
WEBSITES_PORT=7007

# Host Base URLs
APP_CONFIG_app_baseUrl=https://<app-name>.azurewebsites.net
APP_CONFIG_backend_baseUrl=https://<app-name>.azurewebsites.net

# GitHub Integration & OAuth
GITHUB_TOKEN=ghp_...
AUTH_GITHUB_CLIENT_ID=<github-oauth-client-id>
AUTH_GITHUB_CLIENT_SECRET=<github-oauth-client-secret>

# Azure Integration & FinOps
AZURE_SUBSCRIPTION_ID=46269e09-e1e1-4067-af90-78fd27b1b64d
AZURE_TENANT_ID=5f3ec70f-0215-4f44-bdab-f5beda7cdd74
AZURE_CLIENT_ID=e686f48d-5f89-4d3d-ad62-7d02b894f88e
AZURE_CLIENT_SECRET=<azure-client-secret>

# Jira Cloud Integration
JIRA_BASE_URL=https://<your-domain>.atlassian.net
JIRA_BASIC_AUTH_TOKEN=<base64-encoded-email:api-token>

# Datadog Observability
DATADOG_API_KEY=<datadog-api-key>
DATADOG_APP_KEY=<datadog-app-key>
```

---

### Step 4: Automated CI/CD Pipeline Execution

Every `git push` to `main` executes `.github/workflows/deploy-azure-webapp.yml`:

```yaml
name: Build and Deploy IDP to Azure Web App

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout repository
      - uses: actions/checkout@v4

      # 2. Setup Node.js 24 with Yarn caching
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'yarn'

      # 3. Enable Corepack & Install Dependencies
      - run: |
          corepack enable
          yarn install --immutable

      # 4. Compile frontend and pack backend bundle
      - run: yarn build:backend

      # 5. Authenticate with Azure Container Registry
      - uses: azure/docker-login@v2
        with:
          login-server: ${{ secrets.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      # 6. Build and push production Docker image
      - run: |
          docker build \
            -t ${{ secrets.ACR_LOGIN_SERVER }}/backstage-idp:${{ github.sha }} \
            -t ${{ secrets.ACR_LOGIN_SERVER }}/backstage-idp:latest \
            -f packages/backend/Dockerfile .
          docker push ${{ secrets.ACR_LOGIN_SERVER }}/backstage-idp:${{ github.sha }}
          docker push ${{ secrets.ACR_LOGIN_SERVER }}/backstage-idp:latest

      # 7. Deploy updated container to Azure Web App
      - uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          images: ${{ secrets.ACR_LOGIN_SERVER }}/backstage-idp:${{ github.sha }}
```

---

### Step 5: Verification & Health Checks

Once the GitHub Actions workflow finishes (`exited with code 0`):

1. **Root URL Redirect:**
   - Navigating to `https://<app-name>.azurewebsites.net/` immediately redirects to the Software Catalog (`/catalog`).
2. **SSO Sign-In:**
   - Click **Log in with GitHub**. Authentication maps to catalog users with fallback access for all registered team members.
3. **Enterprise Self Service Portal:**
   - Navigate to `/dashboard` to view live Jira tickets, GitHub repos & workflows, Azure Cloud Architecture with real-time FinOps cost analysis, and Datadog APM streams.
4. **App Service Health Diagnostics:**
   - Check live App Service logs via Azure Portal or Azure CLI:
     ```bash
     az webapp log tail --name <app-name> --resource-group devops-maf
     ```

---

##  Local Development Workflow

To run and test the application on your local workstation:

```bash
# 1. Install all monorepo dependencies
yarn install

# 2. Verify TypeScript typing
yarn tsc

# 3. Build backend & frontend bundles
yarn build:all

# 4. Start local development servers
# Starts frontend on http://localhost:3000 and backend on http://localhost:7007
yarn start
```

---

##  Enterprise Security & Compliance

- **SAST & Secret Scanning:** Gitleaks, Semgrep OWASP rules, and Aqua Trivy vulnerability scanners integrated on all templates and repositories.
- **Role-Based Access Control (RBAC):** Azure Service Principal configured with least-privilege `Cost Management Reader` and resource group isolation.
- **Zero Lockout Fallback:** Resilient multi-tier sign-in resolvers preventing developer lockouts during identity syncs.
