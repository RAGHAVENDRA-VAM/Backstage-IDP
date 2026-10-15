const fs = require('fs');
const path = require('path');

const dirs = [
  'ado-dev-project-features', 'ado-dev-scm-activities', 'ado-dev-infra-provisioning', 
  'ado-dev-app-onboarding', 'ado-dev-health-insights', 'ado-dev-experimentation', 
  'ado-pe-templatization-iac', 'ado-pe-standardization-tasks', 'ado-pe-cost-efficiency', 
  'ado-pe-observability-aiops'
];

dirs.forEach(dir => {
  const file = path.join('templates', dir, 'template.yaml');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/description: (Developer Life Cycle:.*?)\n/g, 'description: "$1"\n');
    content = content.replace(/description: (Platform Engineer Life Cycle:.*?)\n/g, 'description: "$1"\n');
    fs.writeFileSync(file, content);
  }
});

console.log('YAML syntax fixed!');
