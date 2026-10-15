const { Octokit } = require('@octokit/rest');
const d = require('dotenv').config();

async function run() {
    const octokit = new Octokit({ auth: d.parsed['GITHUB_TOKEN'] });
    const owner = 'RAGHAVENDRA-VAM';
    const repo = 'terraformcode_webapp';

    const content = `name: Debug Secrets
on: [workflow_dispatch]
jobs:
  debug:
    runs-on: ubuntu-latest
    env:
      ARM_CLIENT_ID: \${{ secrets.AZURE_CLIENT_ID }}
      ARM_TENANT_ID: \${{ secrets.AZURE_TENANT_ID }}
    steps:
      - name: Test length
        run: |
          echo "Client ID Length: \${#ARM_CLIENT_ID}"
          echo "Tenant ID Length: \${#ARM_TENANT_ID}"
`;

    const ref = await octokit.rest.git.getRef({ owner, repo, ref: 'heads/main' });
    const commit = await octokit.rest.git.getCommit({ owner, repo, commit_sha: ref.data.object.sha });
    
    const tree = await octokit.rest.git.createTree({
        owner, repo,
        base_tree: commit.data.tree.sha,
        tree: [{ path: '.github/workflows/debug.yml', mode: '100644', type: 'blob', content }]
    });

    const newCommit = await octokit.rest.git.createCommit({
        owner, repo, message: 'Add debug workflow', tree: tree.data.sha, parents: [commit.data.sha]
    });

    await octokit.rest.git.updateRef({
        owner, repo, ref: 'heads/main', sha: newCommit.data.sha
    });

    console.log('Pushed debug.yml! Triggering workflow...');
    
    await octokit.rest.actions.createWorkflowDispatch({
        owner, repo, workflow_id: 'debug.yml', ref: 'main'
    });
    console.log('Triggered!');
}
run().catch(console.error);
