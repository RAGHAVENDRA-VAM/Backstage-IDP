# Architecture & Design

The Claims UI Portal follows modern cloud-native, micro-frontend principles deployed inside a secure Azure Virtual Network perimeter.

## Architecture Diagram

```mermaid
graph TD
    Client["Policyholder & Claims Adjuster Browser"] --> |HTTPS / TLS 1.3| FrontDoor["Azure Front Door / CDN"]
    FrontDoor --> AppService["Azure Web App: valora-insurance-ui (West US 3)"]
    
    subgraph Core Platform
        AppService --> |REST / JSON| RiskAPI["Risk Analysis Service (devops-risk-analyzer-api)"]
        AppService --> |Events / Webhooks| Guidewire["Guidewire ClaimCenter Webhook"]
        AppService --> |Blob Storage| AzureBlob["Azure Storage Account (Policy Documents)"]
    end
    
    subgraph Observability & Guardrails
        AppService -.-> |APM & Logs| Datadog["Datadog US1 Cloud"]
        AppService -.-> |Key Vault Secrets| KeyVault["Azure Key Vault (Isolation)"]
    end
```

---

## Component Topology

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Edge & CDN** | Azure Front Door | SSL Termination, Global Anycast, WAF Rules |
| **Web Tier** | Azure App Service (Linux) | Node/Nginx Container, Multi-instance auto-scaling (2-5 instances) |
| **API Gateways** | Azure API Management | JWT Authentication, Rate Limiting (500 req/min/client) |
| **Telemetry** | Datadog dd-trace-js | P95 latency tracking, HTTP request volume, continuous APM flamegraphs |

---

## Data Flow: First Notice of Loss (FNOL)

```mermaid
sequenceDiagram
    autonumber
    actor User as Policyholder
    participant UI as Claims UI
    participant Auth as Azure AD / B2C
    participant Risk as Risk Analysis API
    participant GW as Guidewire Webhook

    User->>UI: Submit Loss Event Details
    UI->>Auth: Validate Session Bearer Token
    Auth-->>UI: 200 OK (Claims Assessor Scope)
    UI->>Risk: POST /api/risk/evaluate (Damage Photos & Location)
    Risk-->>UI: Fraud Score & Risk Level (< 0.2 Low Risk)
    UI->>GW: POST /api/v1/claims (Create Claim & Reserve)
    GW-->>UI: Claim Number Generated (CLM-2026-99812)
    UI-->>User: Instant Confirmation & Adjuster Assigned
```
