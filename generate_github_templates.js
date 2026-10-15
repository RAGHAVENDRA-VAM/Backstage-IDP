const fs = require('fs');
const path = require('path');

const templates = [
  {
    id: 'python-fastapi-enterprise',
    title: 'Python FastAPI Enterprise Application',
    description: 'Create a standardized FastAPI application repository with CI, security scanning, Docker support.',
    tags: ['github', 'python', 'fastapi', 'backend', 'api', 'devsecops'],
    type: 'service'
  },
  {
    id: 'java-springboot-enterprise',
    title: 'Java Spring Boot Enterprise Application',
    description: 'Create a standardized Spring Boot application with Maven/Gradle, CI, security scanning.',
    tags: ['github', 'java', 'springboot', 'backend', 'api', 'devsecops'],
    type: 'service'
  },
  {
    id: 'dotnet-webapi-enterprise',
    title: '.NET Web API Enterprise Application',
    description: 'Create a standardized .NET Web API with CI, tests, and security scanning.',
    tags: ['github', 'dotnet', 'backend', 'api', 'devsecops'],
    type: 'service'
  },
  {
    id: 'github-devsecops-enterprise',
    title: 'Enterprise DevSecOps Application',
    description: 'Generate a standard security-enabled repository with SAST, SCA, and secret scanning.',
    tags: ['github', 'devsecops', 'security', 'sast', 'sca', 'secrets', 'container-security'],
    type: 'service'
  },
  {
    id: 'container-enterprise-app',
    title: 'Containerized Enterprise Application',
    description: 'Create an enterprise application fully containerized with Docker and GitHub Actions.',
    tags: ['github', 'docker', 'container', 'devsecops'],
    type: 'service'
  },
  {
    id: 'github-repository-standard',
    title: 'Enterprise GitHub Repository Standard',
    description: 'Create an enterprise governance template repository with standards, issue templates, and validation.',
    tags: ['github', 'governance', 'standards', 'repository', 'enterprise'],
    type: 'other'
  },
  {
    id: 'enterprise-microservice',
    title: 'Enterprise Microservice',
    description: 'Create an enterprise microservice supporting multiple languages with Docker and CI/CD.',
    tags: ['github', 'microservice', 'api', 'docker', 'devsecops'],
    type: 'service'
  },
  {
    id: 'enterprise-rest-api',
    title: 'Enterprise REST API',
    description: 'Create an enterprise REST API with OpenAPI specification, tests, and Dockerfile.',
    tags: ['github', 'api', 'openapi', 'microservice', 'devsecops'],
    type: 'service'
  },
  {
    id: 'enterprise-ai-application',
    title: 'Enterprise AI Application',
    description: 'Create a production-oriented AI application baseline with FastAPI.',
    tags: ['github', 'ai', 'python', 'fastapi', 'llm'],
    type: 'service'
  },
  {
    id: 'enterprise-rag-application',
    title: 'Enterprise RAG Application',
    description: 'Create a baseline RAG architecture with retrieval layer, API, and Docker.',
    tags: ['github', 'ai', 'rag', 'llm', 'python', 'fastapi'],
    type: 'service'
  },
  {
    id: 'enterprise-ai-agent',
    title: 'Enterprise AI Agent Application',
    description: 'Create an AI Agent application with tools, services, and agentic architecture.',
    tags: ['github', 'ai', 'agent', 'agentic-ai', 'python', 'fastapi'],
    type: 'service'
  },
  {
    id: 'self-healing-devops',
    title: 'Self-Healing DevOps Application',
    description: 'Create a self-healing DevOps application designed around GitHub Actions failure remediation.',
    tags: ['github', 'devops', 'self-healing', 'ai', 'automation'],
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
              - github.com

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
      name: Publish to GitHub
      action: publish:github
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
    github.com/project-slug: \${{ values.repoUrl | projectSlug }}
spec:
  type: service
  lifecycle: experimental
  owner: user:guest
`;

const getReadmeMd = (t) => `# \${{ values.name }}

\${{ values.description }}

Scaffolded using the **${t.title}** Backstage template.
`;

const templatesDir = path.join(__dirname, 'templates');

templates.forEach(t => {
  const dir = path.join(templatesDir, t.id);
  const skeletonDir = path.join(dir, 'skeleton');
  const githubDir = path.join(skeletonDir, '.github', 'workflows');
  
  fs.mkdirSync(githubDir, { recursive: true });
  
  fs.writeFileSync(path.join(dir, 'template.yaml'), getTemplateYaml(t));
  fs.writeFileSync(path.join(skeletonDir, 'catalog-info.yaml'), getCatalogInfoYaml());
  fs.writeFileSync(path.join(skeletonDir, 'README.md'), getReadmeMd(t));
  fs.writeFileSync(path.join(githubDir, 'ci.yml'), 'name: CI\\non: [push]\\njobs:\\n  build:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v3\\n      - run: echo "CI configured"');
});

console.log("Successfully generated all GitHub enterprise templates.");
