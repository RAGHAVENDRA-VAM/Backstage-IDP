# ValueMomentum Enterprise Internal Developer Platform (IDP)
## Comprehensive Technical Architecture, Deployment Guide & Implementation Dossier

---

## 1. Executive Summary
The **ValueMomentum Internal Developer Platform (IDP)** is an enterprise-grade developer control plane built on the Spotify Backstage framework, enhanced with proprietary multi-persona governance, real-time observability, cloud automation, and GenAI capabilities via Azure AI Foundry.

It establishes a unified single-pane-of-glass across:
- **Software Catalog**: Discovers, maps, and attributes ownership across 50+ repositories and microservices.
- **Golden Path Scaffolding**: Standardizes software delivery through automated templating, containerization, and cloud deployment.
- **Unified Observability & SRE**: Correlates real-time APM telemetry (Datadog US1) with cloud infrastructure state (Azure West US 3).
- **FinOps & GenAI Governance**: Audits cloud spend velocity alongside LLM token unit economics (GPT-4o, GPT-5.4-mini).
- **Autonomous Shield AI Suite**: Provides 24/7 conversational copilot guidance, root-cause log diagnostics (RCA), and architecture RAG.

---

## 2. Container Image & Resource Specifications

### 2.1 Container Image Characteristics
- **Base Operating System / Runtime**: Debian Linux (`node:24-trixie-slim`)
- **Docker Build Strategy**: Multi-stage asset compilation using Yarn Berry (v4) with immutable locks.
- **Compressed Image Size (ACR)**: **~280 MB – 360 MB**
- **Uncompressed Disk Footprint (Host)**: **~850 MB – 1.1 GB**
- **Container Startup Time**: ~8 – 15 seconds on Azure Web App for Containers.

### 2.2 Sizing Matrix

| Metric / Requirement | POC / Demo Environment | Production (Small-Mid: < 500 Devs) | Enterprise Scale (1,000+ Devs) |
| :--- | :--- | :--- | :--- |
| **Compute Engine** | Azure App Service (Linux) | Azure App Service (Linux) | Azure Kubernetes Service (AKS) or App Service Multi-Instance |
| **App Service SKU** | **B1 / B2** (Basic) | **P1v3** (Premium v3) | **P2v3 / P3v3** (2+ Autoscale Instances) |
| **vCPU / Core Count** | 1 – 2 vCPU | 2 vCPU | 4 – 8 vCPU |
| **System Memory (RAM)** | 1.75 GB – 3.5 GB | 8 GB | 16 GB – 32 GB |
| **Database Engine** | In-Memory SQLite | Azure Database for PostgreSQL (Flexible Server, B2s) | Azure Database for PostgreSQL (Flexible Server, D4ds_v5) |
| **Database Storage** | Ephemeral | 32 GB SSD (Auto-grow enabled) | 128 GB+ Premium SSD with High IOPS |
| **Target Availability (SLA)**| 99.0% | 99.95% | 99.99% (Multi-region active/passive) |

---

## 3. High-Level Architecture Topology

- **Ingress & Authentication**: GitHub OAuth Provider with custom enterprise sign-in resolver mapping corporate emails and catalog groups.
- **Frontend Layer**: Backstage React SPA with material-ui enterprise theme and dynamic persona tab-filtering.
- **Backend Core**: Node.js 24 runtime with Knex SQL ORM and dedicated proxy micro-modules:
  - `aiAssistantProxy`: Azure AI Foundry adapter supporting both standard and reasoning models (`max_completion_tokens`).
  - `azureDeployProxy`: Azure Resource Manager (ARM) integration for live App Services, cost management, and Kudu zip deployment.
  - `integrationsProxy`: Atlassian Jira Cloud REST API, GitHub Octokit, and Datadog APM metrics.
- **Data Persistence**: Azure Database for PostgreSQL Flexible Server.

---

## 4. End-to-End Deployment Architecture & CI/CD Pipeline

- **Workflow**: Automated GitHub Actions workflow (`deploy-azure-webapp.yml`) triggers on branch push (`Feature-01` / `main`).
- **Steps**:
  1. Codespace checkout & Node 24 setup.
  2. Yarn build compilation (`yarn build:backend`).
  3. Docker build using `packages/backend/Dockerfile`.
  4. Secure push to Azure Container Registry (ACR).
  5. Deployment webhook to Azure Web App for zero-downtime container swap.

---

## 5. Environment Configuration & App Settings

```env
# Core Runtime
NODE_ENV=production
PORT=7007
WEBSITES_PORT=7007
APP_CONFIG_app_baseUrl=https://backstage-idp-gvftaxetancteec5.westus3-01.azurewebsites.net
APP_CONFIG_backend_baseUrl=https://backstage-idp-gvftaxetancteec5.westus3-01.azurewebsites.net

# Authentication
AUTH_GITHUB_CLIENT_ID=<client-id>
AUTH_GITHUB_CLIENT_SECRET=<client-secret>

# Third-Party Integrations
GITHUB_TOKEN=ghp_...
JIRA_BASE_URL=https://valuemomentum.atlassian.net
JIRA_BASIC_AUTH_TOKEN=<base64-token>
DATADOG_API_KEY=<dd-api-key>
DATADOG_APP_KEY=<dd-app-key>

# Azure Resource Management (ARM)
AZURE_TENANT_ID=<tenant-id>
AZURE_SUBSCRIPTION_ID=46269e09-e1e1-4067-af90-78fd27b1b64d
AZURE_CLIENT_ID=<spn-client-id>
AZURE_CLIENT_SECRET=<spn-client-secret>

# Azure AI Foundry
AZURE_OPENAI_ENDPOINT=https://code-suggestion-ai-model.openai.azure.com/
AZURE_OPENAI_KEY=<foundry-key>
AZURE_OPENAI_DEPLOYMENT=gpt-5.4-mini
```

---

## 6. Enterprise Persona & Role Governance

- **Platform Engineering (Admin)**: Full administrative authority across all 10 Command Center tabs, multi-region Azure infrastructure, SRE controls, and security policies.
- **Application Developers**: Focused workspace showing Software Catalog, Scaffolder, Jira sprint backlog, GitHub PRs/Actions, and service health.
- **FinOps & Cost Governance**: Unified financial operations hub showing Azure infrastructure run rate (\$12,480/mo), AI token burn rate (\$3,840/mo), and rightsizing recommendations.

---

## 7. Client Implementation Roadmap & Required Skillsets

### Required Engineering Roles:
1. **Senior Platform / DevOps Engineer (Lead)**: Azure App Services, ACR, Key Vault, GitHub Actions, ARM/Bicep, and networking.
2. **Full-Stack TypeScript / Backstage Specialist**: TypeScript, Node.js 24, React, Knex ORM, PostgreSQL schema design, and Backstage plugins.
3. **Cloud Architect / AI Engineer**: Azure AI Foundry, Azure OpenAI model deployments, RAG architecture, Datadog APM, and FinOps unit economics.

### Standard 2-Week Implementation Timeline:
- **Days 1–3**: Cloud Foundation & Infrastructure Provisioning (App Service, ACR, PostgreSQL, Key Vault).
- **Days 4–6**: SaaS Integration (GitHub OAuth, Jira Cloud API, Datadog APM, Azure AI Foundry).
- **Days 7–9**: Organization Catalog Mapping & Custom Scaffolder Golden Paths.
- **Days 10–12**: Security Hardening, Verification, and Client Operational Handover.
