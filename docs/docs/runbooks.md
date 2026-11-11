# Incident Response & SRE Runbooks

This guide outlines standard operational procedures (SOP), SLO error budget thresholds, and automated recovery actions for the **Claims UI Portal**.

## Service Level Objectives (SLOs)

- **Availability Target**: `99.95%` monthly uptime.
- **P95 Latency SLA**: `< 250 ms`.
- **P99 Latency SLA**: `< 500 ms`.
- **Max Permitted Downtime**: 21 minutes / calendar month.

---

## Alert Triggers & PagerDuty Escalation

| Monitor ID | Metric / Condition | Severity | Automated Action |
| :--- | :--- | :--- | :--- |
| `MON-CLM-01` | HTTP 5xx error rate > 1.5% for 3 mins | **P1 - Critical** | Autonomous container restart via Backstage SRE API |
| `MON-CLM-02` | P95 Latency > 800ms for 5 mins | **P2 - High** | Auto-scale App Service instance count +1 |
| `MON-CLM-03` | Azure App Service memory > 85% | **P3 - Warning** | Trigger memory dump & restart background worker threads |

---

## Remediation Runbooks

### 1. Recycling the Azure Web App Container
If memory leak or unresponsive node worker occurs, recycle the container directly from Backstage:
1. Navigate to Backstage IDP &rarr; **Dashboard** &rarr; **Site Reliability Engineering**.
2. Locate `valora-insurance-ui`.
3. Click **Recycle Container**.
4. Confirm health check returns `200 OK` within 45 seconds.

### 2. Manual CLI Rollback (Emergency)
```bash
az webapp deployment slot swap \
  --name valora-insurance-ui \
  --resource-group devops-maf \
  --slot staging \
  --target-slot production
```
