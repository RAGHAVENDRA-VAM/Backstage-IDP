const fs = require('fs');
const path = require('path');

const templates = [
  {
    id: 'ado-react-enterprise-app',
    title: 'React Enterprise Application (ADO)',
    description: 'React application with Azure Pipelines YAML, tests, Dockerfile.',
    tags: ['azure-devops', 'ado', 'react', 'frontend', 'devsecops'],
    type: 'website'
  },
  {
    id: 'ado-python-fastapi-enterprise',
    title: 'Python FastAPI Enterprise Application (ADO)',
    description: 'FastAPI with tests, Dockerfile, azure-pipelines.yml.',
    tags: ['azure-devops', 'ado', 'python', 'fastapi', 'backend', 'devsecops'],
    type: 'service'
  },
  {
    id: 'ado-java-springboot-enterprise',
    title: 'Java Spring Boot Enterprise Application (ADO)',
    description: 'Spring Boot with Maven/Gradle, tests, azure-pipelines.yml.',
    tags: ['azure-devops', 'ado', 'java', 'springboot', 'backend', 'devsecops'],
    type: 'service'
  },
  {
    id: 'ado-dotnet-webapi-enterprise',
    title: '.NET Web API Enterprise Application (ADO)',
    description: '.NET Web API with tests, Dockerfile, azure-pipelines.yml.',
    tags: ['azure-devops', 'ado', 'dotnet', 'backend', 'api', 'devsecops'],
    type: 'service'
  },
  {
    id: 'ado-nodejs-api',
    title: 'Node.js API (ADO)',
    description: 'Node.js API with tests, Dockerfile, azure-pipelines.yml.',
    tags: ['azure-devops', 'ado', 'nodejs', 'api', 'backend'],
    type: 'service'
  },
  {
    id: 'ado-enterprise-devsecops',
    title: 'Enterprise Azure DevOps DevSecOps Application',
    description: 'Generate Azure Pipelines workflows/stages for SAST, SCA, and container scanning.',
    tags: ['azure-devops', 'ado', 'devsecops', 'security', 'sast', 'sca'],
    type: 'service'
  },
  {
    id: 'ado-container-app',
    title: 'Azure DevOps Container Application',
    description: 'Dockerfile, .dockerignore, azure-pipelines.yml.',
    tags: ['azure-devops', 'ado', 'docker', 'container', 'devsecops'],
    type: 'service'
  },
  {
    id: 'ado-azure-webapp-enterprise',
    title: 'Azure Web App Enterprise Application',
    description: 'Azure Pipeline, deployment configuration, application code.',
    tags: ['azure-devops', 'ado', 'azure', 'webapp', 'cloud'],
    type: 'service'
  },
  {
    id: 'ado-azure-terraform-infrastructure',
    title: 'Azure Terraform Infrastructure',
    description: 'Terraform modules for Azure infrastructure provisioning.',
    tags: ['azure-devops', 'ado', 'terraform', 'azure', 'infrastructure', 'iac'],
    type: 'other'
  },
  {
    id: 'ado-enterprise-microservice',
    title: 'Azure DevOps Enterprise Microservice',
    description: 'Azure Pipeline, catalog-info, README, tests.',
    tags: ['azure-devops', 'ado', 'microservice', 'api', 'docker', 'azure'],
    type: 'service'
  },
  {
    id: 'ado-enterprise-ai-application',
    title: 'Azure DevOps Enterprise AI Application',
    description: 'Python FastAPI AI service abstraction without hardcoded credentials.',
    tags: ['azure-devops', 'ado', 'ai', 'python', 'fastapi'],
    type: 'service'
  },
  {
    id: 'ado-rag-application',
    title: 'Azure DevOps RAG Application',
    description: 'RAG layer, retrieval abstraction, Azure Pipeline.',
    tags: ['azure-devops', 'ado', 'rag', 'ai', 'llm'],
    type: 'service'
  },
  {
    id: 'ado-ai-agent',
    title: 'Azure DevOps AI Agent Application',
    description: 'agent, tools, services, api, azure-pipelines.yml.',
    tags: ['azure-devops', 'ado', 'ai', 'agent', 'agentic-ai'],
    type: 'service'
  },
  {
    id: 'ado-self-healing-devops',
    title: 'Azure DevOps Self-Healing DevOps Application',
    description: 'Azure Pipeline failure, remediation proposal, self-healing.',
    tags: ['azure-devops', 'ado', 'devops', 'self-healing', 'ai', 'automation'],
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
  fs.writeFileSync(path.join(skeletonDir, 'azure-pipelines.yml'), 'trigger:\n- main\n\npool:\n  vmImage: ubuntu-latest\n\nsteps:\n- script: echo "ADO CI configured"\n  displayName: \'Run a one-line script\'');
});

console.log("Successfully generated all ADO enterprise templates.");
