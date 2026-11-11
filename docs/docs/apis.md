# API & Integration Specs

Claims UI Portal integrates with upstream identity providers and downstream claim settlement APIs.

## Primary Endpoints Consumed

### 1. FNOL Intake API
- **Endpoint**: `POST /api/claims/fnol-intake`
- **Host**: `https://valora-insurance-ui-aydmbcc7angzfjg5.westus3-01.azurewebsites.net`
- **Auth**: `Bearer <JWT_TOKEN>`

#### Request Payload
```json
{
  "policyNumber": "POL-CA-2026-88741",
  "lossDate": "2026-11-10T14:30:00Z",
  "incidentType": "Collision",
  "claimant": {
    "name": "Jane Doe",
    "phone": "+1-415-555-0192",
    "vehicleVin": "1HGCR2F83HA001928"
  },
  "estimatedDamage": 4200.00
}
```

#### Response (201 Created)
```json
{
  "claimId": "CLM-2026-99812",
  "status": "In_Review",
  "assignedAdjuster": "pankajk@valuemomentum.com",
  "preliminaryReserve": 5000.00
}
```

---

### 2. Risk Assessment Ingestion
- **Target**: `https://devops-risk-analyzer-api.azurewebsites.net/api/risk/evaluate`
- **Latency SLA**: < 180ms
- **Payload Schema**: OpenTelemetry v1 compliant payload with claim risk indicators.
