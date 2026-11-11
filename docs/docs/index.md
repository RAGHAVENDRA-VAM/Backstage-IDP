# Claims UI Portal

Welcome to the official technical documentation for **Claims UI Portal** (`valora-insurance-ui`).

## Executive Overview

Claims UI Portal is ValueMomentum's enterprise insurance First Notice of Loss (FNOL) intake, policyholder self-service, and claims adjuster dashboard. It acts as the customer-facing frontend communicating with downstream risk analysis, Guidewire core processing, and automated payment gateways.

### Key Service Characteristics

- **Owner**: [Platform Engineering Team](https://backstage-idp-gvftaxetancteec5.westus3-01.azurewebsites.net/catalog/default/group/platform-engineering)
- **Lifecycle**: Production Tier-1 Mission Critical
- **Hosting**: Azure Web App for Containers (`valora-insurance-ui` in region `West US 3`)
- **Technology Stack**: React 18, TypeScript, Material-UI, Vite
- **Observability**: Live Datadog APM Traces, Real-time Synthetic Monitors, and Operational Log Streams
- **Agile Tracker**: Atlassian Jira Cloud (`SCRUM` sprint board)

---

## Capabilities & Workflows

1. **FNOL Fast-Track Registration**:
   - Digital submission of auto, property, and casualty loss events.
   - Immediate policy coverage validation against the Guidewire policy center webhook.
   - Dynamic document upload for accident scene photos and police reports.

2. **Adjuster Workspace**:
   - Integrated dashboard for adjusters to record initial liability evaluations.
   - Automated initial reserve setting by exposure line.
   - Real-time duplicate claim detection algorithms.

3. **Autonomous Self-Healing**:
   - Integrated with Shield AI failure agents for automated health probes and zero-downtime container recycling.

---

## Quick Navigation

- [Architecture & Sequence Diagrams](architecture.md)
- [API Contracts & Downstream Integrations](apis.md)
- [Incident Response & SRE Runbooks](runbooks.md)
- [GitHub Actions & CI/CD Pipelines](deployment.md)
