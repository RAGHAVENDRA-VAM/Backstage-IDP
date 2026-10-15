const fs = require('fs');
const path = require('path');

const templates = [
  // Developer Life Cycle
  {
    id: 'ado-dev-project-features',
    title: 'Work on Project, Features & User Stories',
    description: 'Developer Life Cycle: Automate workspace setup for new projects, features, or user stories.',
    tags: ['azure-devops', 'ado', 'developer', 'project', 'features'],
    type: 'service'
  },
  {
    id: 'ado-dev-scm-activities',
    title: 'Day-to-Day SCM Activities',
    description: 'Developer Life Cycle: Scaffold standard branching strategies, PR templates, and SCM automation.',
    tags: ['azure-devops', 'ado', 'developer', 'scm', 'git'],
    type: 'service'
  },
  {
    id: 'ado-dev-infra-provisioning',
    title: 'Application Specific Infra Provisioning',
    description: 'Developer Life Cycle: Self-service provisioning of application-specific infrastructure (databases, queues).',
    tags: ['azure-devops', 'ado', 'developer', 'infrastructure', 'provisioning'],
    type: 'other'
  },
  {
    id: 'ado-dev-app-onboarding',
    title: 'Application Onboarding & Deployment',
    description: 'Developer Life Cycle: Onboard a new application and setup ADO deployment pipelines.',
    tags: ['azure-devops', 'ado', 'developer', 'onboarding', 'deployment'],
    type: 'service'
  },
  {
    id: 'ado-dev-health-insights',
    title: 'Application Health Insights',
    description: 'Developer Life Cycle: Generate health monitoring dashboards and alerting configurations.',
    tags: ['azure-devops', 'ado', 'developer', 'monitoring', 'health'],
    type: 'service'
  },
  {
    id: 'ado-dev-experimentation',
    title: 'Experimentation With New Services',
    description: 'Developer Life Cycle: Spin up isolated sandbox environments for experimenting with new tech.',
    tags: ['azure-devops', 'ado', 'developer', 'sandbox', 'experimentation'],
    type: 'service'
  },
  
  // Platform Engineer Life Cycle
  {
    id: 'ado-pe-templatization-iac',
    title: 'Templatization including IaC',
    description: 'Platform Engineer Life Cycle: Create new reusable infrastructure-as-code modules and templates.',
    tags: ['azure-devops', 'ado', 'platform', 'iac', 'terraform'],
    type: 'other'
  },
  {
    id: 'ado-pe-standardization-tasks',
    title: 'Standardization and Automate Common Tasks',
    description: 'Platform Engineer Life Cycle: Scaffold automated scripts/pipelines for common operational tasks.',
    tags: ['azure-devops', 'ado', 'platform', 'automation', 'standardization'],
    type: 'service'
  },
  {
    id: 'ado-pe-cost-efficiency',
    title: 'Ensure Cost Efficiency',
    description: 'Platform Engineer Life Cycle: Deploy cost-monitoring and resource optimization policies.',
    tags: ['azure-devops', 'ado', 'platform', 'finops', 'cost'],
    type: 'service'
  },
  {
    id: 'ado-pe-observability-aiops',
    title: 'Unified Observability + AIOps Integration',
    description: 'Platform Engineer Life Cycle: Setup unified logging, tracing, and AIOps integrations.',
    tags: ['azure-devops', 'ado', 'platform', 'observability', 'aiops'],
    type: 'service'
  }
];

const getTemplateYaml = (t) => `apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: ${t.id}
  title: ${t.title}
  description: ${t.description}
  tags:
${t.tags.map(tag => `    - ${tag}`).join('\n')}
spec:
  owner: user:guest
  type: ${t.type}

  parameters:
    - title: Provide Information
      required:
        - name
        - description
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the component
          ui:autofocus: true
        description:
          title: Description
          type: string
          description: Help others understand what this component is for.
    - title: Choose a location
      required:
        - repoUrl
      properties:
        repoUrl:
          title: Repository Location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - dev.azure.com

  steps:
    - id: fetch-base
      name: Fetch Base Template
      action: fetch:template
      input:
        url: ./skeleton
        values:
          name: \${{ parameters.name }}
          description: \${{ parameters.description }}
          repoUrl: \${{ parameters.repoUrl }}

    - id: publish
      name: Publish to Azure DevOps
      action: publish:azure
      input:
        description: This is \${{ parameters.name }}
        repoUrl: \${{ parameters.repoUrl }}

    - id: register
      name: Register in Backstage
      action: catalog:register
      input:
        repoContentsUrl: \${{ steps['publish'].output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'

  output:
    links:
      - title: Repository
        url: \${{ steps['publish'].output.remoteUrl }}
      - title: Open in catalog
        icon: catalog
        entityRef: \${{ steps['register'].output.entityRef }}
`;

const getCatalogInfoYaml = () => `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: \${{ values.name }}
  description: \${{ values.description }}
  annotations:
    dev.azure.com/project-repo: \${{ values.repoUrl | projectSlug }}
spec:
  type: service
  lifecycle: experimental
  owner: user:guest
`;

const getReadmeMd = (t) => `# \${{ values.name }}

\${{ values.description }}

Scaffolded using the **${t.title}** Backstage template for Azure DevOps.
`;

const templatesDir = path.join(__dirname, 'templates');

templates.forEach(t => {
  const dir = path.join(templatesDir, t.id);
  const skeletonDir = path.join(dir, 'skeleton');
  
  fs.mkdirSync(skeletonDir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, 'template.yaml'), getTemplateYaml(t));
  fs.writeFileSync(path.join(skeletonDir, 'catalog-info.yaml'), getCatalogInfoYaml());
  fs.writeFileSync(path.join(skeletonDir, 'README.md'), getReadmeMd(t));
  fs.writeFileSync(path.join(skeletonDir, 'azure-pipelines.yml'), 'trigger:\n- main\n\npool:\n  vmImage: ubuntu-latest\n\nsteps:\n- script: echo "ADO Persona Workflow configured"\n  displayName: \'Run a one-line script\'');
});

console.log("Successfully generated all ADO Persona templates.");
