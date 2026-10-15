const fs = require('fs');
const path = require('path');

const enhancements = {
  'ado-dev-project-features': `
    - title: Project Details
      required:
        - name
        - description
        - projectType
        - ticketUrl
      properties:
        name:
          title: Feature/Project Name
          type: string
          description: Unique name of the feature or project
          ui:autofocus: true
        description:
          title: Description
          type: string
        projectType:
          title: Project Type
          type: string
          enum: ['Microservice', 'Frontend', 'Library', 'Data Pipeline']
          default: 'Microservice'
        ticketUrl:
          title: Azure Boards / Jira Ticket URL
          type: string
          format: uri
`,
  'ado-dev-scm-activities': `
    - title: SCM Configuration
      required:
        - name
        - description
        - branchingStrategy
      properties:
        name:
          title: Repository Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        branchingStrategy:
          title: Branching Strategy
          type: string
          enum: ['Trunk-Based Development', 'GitFlow', 'GitHub Flow']
          default: 'Trunk-Based Development'
        requireReviewers:
          title: Require PR Reviewers
          type: boolean
          default: true
        includePRTemplate:
          title: Include standard PR Template
          type: boolean
          default: true
`,
  'ado-dev-infra-provisioning': `
    - title: Infrastructure Specifications
      required:
        - name
        - description
        - environment
        - dbType
      properties:
        name:
          title: Infrastructure Component Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        environment:
          title: Target Environment
          type: string
          enum: ['Development', 'QA', 'Staging', 'Production']
          default: 'Development'
        dbType:
          title: Database Type
          type: string
          enum: ['Azure SQL', 'CosmosDB', 'PostgreSQL Flexible Server', 'Redis Cache', 'None']
          default: 'None'
        computeSize:
          title: Compute Size
          type: string
          enum: ['Small', 'Medium', 'Large']
          default: 'Small'
`,
  'ado-dev-app-onboarding': `
    - title: Application Onboarding
      required:
        - name
        - description
        - tier
        - oncallEmail
      properties:
        name:
          title: Application Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        tier:
          title: Application Tier (Critcality)
          type: string
          enum: ['Tier 1 (Mission Critical)', 'Tier 2 (Business Critical)', 'Tier 3 (Internal Tool)']
          default: 'Tier 2 (Business Critical)'
        oncallEmail:
          title: On-Call Distribution List / Email
          type: string
          format: email
`,
  'ado-dev-health-insights': `
    - title: Health & Monitoring Config
      required:
        - name
        - description
        - sloTarget
      properties:
        name:
          title: Monitoring Dashboard Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        sloTarget:
          title: Service Level Objective (SLO)
          type: string
          enum: ['99.0%', '99.9%', '99.95%', '99.99%']
          default: '99.9%'
        alertChannel:
          title: Alert Notification Channel
          type: string
          enum: ['Microsoft Teams', 'Slack', 'Email Only']
          default: 'Microsoft Teams'
`,
  'ado-dev-experimentation': `
    - title: Sandbox Parameters
      required:
        - name
        - description
        - ttlDays
      properties:
        name:
          title: Experiment Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        ttlDays:
          title: Time-to-Live (Days until auto-deletion)
          type: integer
          minimum: 1
          maximum: 30
          default: 7
        costCenter:
          title: Cost Center Code
          type: string
`,
  'ado-pe-templatization-iac': `
    - title: IaC Module Config
      required:
        - name
        - description
        - iacTool
      properties:
        name:
          title: Module Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        iacTool:
          title: Infrastructure as Code Tool
          type: string
          enum: ['Terraform', 'Bicep', 'Pulumi', 'ARM Templates']
          default: 'Terraform'
        cloudProvider:
          title: Cloud Provider Focus
          type: string
          enum: ['Azure', 'AWS', 'GCP', 'Agnostic']
          default: 'Azure'
`,
  'ado-pe-standardization-tasks': `
    - title: Task Automation
      required:
        - name
        - description
        - runnerType
      properties:
        name:
          title: Automation Task Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        runnerType:
          title: Execution Runner
          type: string
          enum: ['Azure Pipeline (Cron)', 'Azure Function (Webhook)', 'GitHub Action']
          default: 'Azure Pipeline (Cron)'
        schedule:
          title: Cron Schedule (if applicable)
          type: string
          default: '0 0 * * *'
`,
  'ado-pe-cost-efficiency': `
    - title: FinOps Configuration
      required:
        - name
        - description
        - budgetLimit
      properties:
        name:
          title: Cost Policy Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        budgetLimit:
          title: Monthly Budget Limit (USD)
          type: integer
          default: 1000
        actionOnExceed:
          title: Action when Budget Exceeded
          type: string
          enum: ['Alert Only', 'Stop Non-Production Resources']
          default: 'Alert Only'
`,
  'ado-pe-observability-aiops': `
    - title: Observability Setup
      required:
        - name
        - description
        - apmTool
      properties:
        name:
          title: Integration Name
          type: string
          ui:autofocus: true
        description:
          title: Description
          type: string
        apmTool:
          title: APM Platform
          type: string
          enum: ['Azure Application Insights', 'Datadog', 'Dynatrace', 'New Relic']
          default: 'Azure Application Insights'
        logRetention:
          title: Log Retention Days
          type: integer
          default: 30
`
};

const dirs = Object.keys(enhancements);

dirs.forEach(dir => {
  const file = path.join('templates', dir, 'template.yaml');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the basic parameters block with the enhanced one
    const paramsStart = content.indexOf('  parameters:');
    const stepsStart = content.indexOf('  steps:');
    
    if (paramsStart !== -1 && stepsStart !== -1) {
      const locationBlock = `    - title: Choose a location
      required:
        - repoUrl
      properties:
        repoUrl:
          title: Repository Location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - dev.azure.com\n\n`;
      
      const newParams = '  parameters:\n' + enhancements[dir] + locationBlock;
      content = content.substring(0, paramsStart) + newParams + content.substring(stepsStart);
      
      fs.writeFileSync(file, content);
    }
  }
});

console.log('Successfully added detailed fields to all 10 Persona templates.');
