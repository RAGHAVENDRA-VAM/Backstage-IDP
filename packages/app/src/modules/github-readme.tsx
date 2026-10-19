import React from 'react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { useEntity } from '@backstage/plugin-catalog-react';
import { InfoCard, MarkdownContent, Progress } from '@backstage/core-components';
import { Box, Typography, Button } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import GitHubIcon from '@material-ui/icons/GitHub';
import useAsync from 'react-use/lib/useAsync';

const CustomReadmeCard = () => {
  const { entity } = useEntity();
  const slug = entity?.metadata?.annotations?.['github.com/project-slug'] || '';
  const cleanRepoName = slug.includes('/') ? slug.split('/')[1] : slug;

  const { value, loading } = useAsync(async () => {
    if (!slug) return '';
    const res = await fetch(`/api/integrations-proxy/github/overview?repo=${encodeURIComponent(slug)}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.readme || '';
  }, [slug]);

  if (!slug) return null;

  return (
    <InfoCard
      title="README.md"
      action={
        <Button
          size="small"
          color="primary"
          startIcon={<GitHubIcon />}
          endIcon={<OpenInNewIcon fontSize="small" />}
          href={`https://github.com/${slug}#readme`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textTransform: 'none', fontWeight: 600 }}
        >
          View on GitHub
        </Button>
      }
    >
      {loading ? (
        <Progress />
      ) : value ? (
        <Box style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 8 }}>
          <MarkdownContent content={value} />
        </Box>
      ) : (
        <Typography variant="body2" color="textSecondary" style={{ padding: 16 }}>
          No README.md content found for {cleanRepoName}.
        </Typography>
      )}
    </InfoCard>
  );
};

const readmeCardExtension = EntityCardBlueprint.make({
  name: 'github-readme',
  params: {
    filter: (entity) => Boolean(entity.metadata.annotations?.['github.com/project-slug']),
    loader: async () => <CustomReadmeCard />,
  },
});

export const githubReadmeModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [readmeCardExtension],
});
