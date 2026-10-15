const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');
const dirs = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());

const personaTemplates = [
  'ado-dev-project-features', 'ado-dev-scm-activities', 'ado-dev-infra-provisioning', 
  'ado-dev-app-onboarding', 'ado-dev-health-insights', 'ado-dev-experimentation', 
  'ado-pe-templatization-iac', 'ado-pe-standardization-tasks', 'ado-pe-cost-efficiency', 
  'ado-pe-observability-aiops'
];

dirs.forEach(dir => {
  // Skip the ones we already enhanced
  if (personaTemplates.includes(dir)) return;

  const file = path.join(templatesDir, dir, 'template.yaml');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    const paramsStart = content.indexOf('  parameters:');
    const stepsStart = content.indexOf('  steps:');
    
    if (paramsStart !== -1 && stepsStart !== -1) {
      let customParams = `
    - title: Component Details
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
        ownerTeam:
          title: Owning Team / Distribution List
          type: string
          default: 'platform-engineering'
        costCenter:
          title: Cost Center
          type: string
          default: 'CC-100'
`;

      // Dynamically add fields based on template name keywords
      if (dir.includes('react') || dir.includes('frontend') || dir.includes('web-app')) {
        customParams += `
    - title: Frontend Specifications
      required:
        - nodeVersion
      properties:
        nodeVersion:
          title: Node.js Version
          type: string
          enum: ['18.x', '20.x']
          default: '20.x'
        packageManager:
          title: Package Manager
          type: string
          enum: ['npm', 'yarn', 'pnpm']
          default: 'yarn'
        testingFramework:
          title: E2E Testing Framework
          type: string
          enum: ['Cypress', 'Playwright', 'None']
          default: 'Playwright'
`;
      } else if (dir.includes('python') || dir.includes('fastapi')) {
        customParams += `
    - title: Python Specifications
      required:
        - pythonVersion
      properties:
        pythonVersion:
          title: Python Version
          type: string
          enum: ['3.10', '3.11', '3.12']
          default: '3.11'
        packageManager:
          title: Package/Dependency Manager
          type: string
          enum: ['pip', 'poetry', 'pipenv']
          default: 'poetry'
        includeLinting:
          title: Include Black & Flake8
          type: boolean
          default: true
`;
      } else if (dir.includes('java') || dir.includes('springboot')) {
        customParams += `
    - title: Java Specifications
      required:
        - javaVersion
      properties:
        javaVersion:
          title: Java Development Kit (JDK) Version
          type: string
          enum: ['11', '17', '21']
          default: '17'
        buildTool:
          title: Build Tool
          type: string
          enum: ['Maven', 'Gradle']
          default: 'Maven'
        includeActuator:
          title: Include Spring Boot Actuator (Health/Metrics)
          type: boolean
          default: true
`;
      } else if (dir.includes('dotnet')) {
        customParams += `
    - title: .NET Specifications
      required:
        - dotnetVersion
      properties:
        dotnetVersion:
          title: .NET Target Framework
          type: string
          enum: ['net6.0', 'net8.0']
          default: 'net8.0'
        testFramework:
          title: Unit Test Framework
          type: string
          enum: ['xUnit', 'NUnit', 'MSTest']
          default: 'xUnit'
`;
      } else if (dir.includes('node') || dir.includes('microservice') || dir.includes('api')) {
        customParams += `
    - title: API & Microservice Config
      required:
        - dbType
      properties:
        dbType:
          title: Target Database
          type: string
          enum: ['PostgreSQL', 'MongoDB', 'CosmosDB', 'None']
          default: 'PostgreSQL'
        includeSwagger:
          title: Generate Swagger / OpenAPI Docs
          type: boolean
          default: true
`;
      } else if (dir.includes('ai') || dir.includes('rag') || dir.includes('agent')) {
        customParams += `
    - title: AI & LLM Configuration
      required:
        - llmProvider
      properties:
        llmProvider:
          title: Primary LLM Provider
          type: string
          enum: ['Azure OpenAI', 'OpenAI', 'Anthropic', 'Local/Ollama']
          default: 'Azure OpenAI'
        embeddingModel:
          title: Embedding Model (for RAG)
          type: string
          enum: ['text-embedding-ada-002', 'text-embedding-3-small', 'None']
          default: 'text-embedding-ada-002'
        vectorDb:
          title: Vector Database
          type: string
          enum: ['Pinecone', 'Qdrant', 'Milvus', 'Azure AI Search']
          default: 'Azure AI Search'
`;
      } else if (dir.includes('devsecops') || dir.includes('security')) {
        customParams += `
    - title: Security Integrations
      required:
        - sastTool
      properties:
        sastTool:
          title: Static Application Security Testing (SAST)
          type: string
          enum: ['SonarQube', 'Checkmarx', 'Veracode', 'GitHub Advanced Security']
          default: 'SonarQube'
        scaTool:
          title: Software Composition Analysis (SCA)
          type: string
          enum: ['Snyk', 'Mend (WhiteSource)', 'Dependabot']
          default: 'Snyk'
        containerScanning:
          title: Enable Container Image Scanning
          type: boolean
          default: true
`;
      } else if (dir.includes('terraform') || dir.includes('infrastructure')) {
         customParams += `
    - title: Infrastructure Config
      required:
        - cloudProvider
      properties:
        cloudProvider:
          title: Primary Cloud Provider
          type: string
          enum: ['Azure', 'AWS', 'GCP']
          default: 'Azure'
        region:
          title: Default Deployment Region
          type: string
          enum: ['East US', 'West Europe', 'us-east-1', 'eu-central-1']
          default: 'East US'
`;
      } else {
        // Fallback for generic templates
        customParams += `
    - title: Enterprise Settings
      required:
        - criticality
      properties:
        criticality:
          title: Business Criticality
          type: string
          enum: ['High', 'Medium', 'Low']
          default: 'Medium'
        deploymentStrategy:
          title: Deployment Strategy
          type: string
          enum: ['Blue/Green', 'Canary', 'Rolling']
          default: 'Rolling'
`;
      }

      // Add the location block based on provider
      let allowedHost = dir.includes('ado-') || dir.includes('azure') ? 'dev.azure.com' : 'github.com';
      if(dir === 'terraform-aws') allowedHost = 'github.com'; // Special case from earlier

      const locationBlock = `
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
              - ${allowedHost}\n\n`;
      
      const newParams = '  parameters:\n' + customParams + locationBlock;
      content = content.substring(0, paramsStart) + newParams + content.substring(stepsStart);
      
      fs.writeFileSync(file, content);
    }
  }
});

console.log('Successfully added detailed fields to ALL remaining templates.');
