/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createAzureWorkItemAction } from './actions/azureWorkItem';
import { createAzureSecretsAction } from './actions/azureSecrets';
import { createAzureSecretsPushAction } from './actions/azureSecretsPush';
import { createAzureAppDeployAction } from './actions/azureAppDeploy';

const scaffolderModuleCustomActions = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-actions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(createAzureWorkItemAction({ config }));
        scaffolder.addActions(createAzureSecretsAction());
        scaffolder.addActions(createAzureSecretsPushAction());
        scaffolder.addActions(createAzureAppDeployAction());
      },
    });
  },
});

// Scaffolder
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-notifications'));
backend.add(scaffolderModuleCustomActions);

// TechDocs
backend.add(import('@backstage/plugin-techdocs-backend'));

// GitHub authentication
import {
  authProvidersExtensionPoint,
  createOAuthProviderFactory,
  commonSignInResolvers,
  createSignInResolverFactory,
} from '@backstage/plugin-auth-node';

import {
  githubAuthenticator,
  githubSignInResolvers,
} from '@backstage/plugin-auth-backend-module-github-provider';

const enterpriseCustomResolver = createSignInResolverFactory({
  create() {
    return async (info, ctx) => {
      // 1. Try mapping by GitHub username (e.g. RAGHAVENDRA-VAM -> raghavendra-vam)
      const username = (info.result as any)?.fullProfile?.username;
      if (username) {
        try {
          return await ctx.signInWithCatalogUser({
            filter: {
              'metadata.name': username.toLowerCase(),
            },
          });
        } catch (e: any) {
          if (e.name !== 'NotFoundError') throw e;
        }
      }

      // 2. Try mapping by GitHub email gracefully (without crashing if email is private)
      const email = info.profile.email;
      if (email) {
        try {
          return await ctx.signInWithCatalogUser({
            filter: {
              'spec.profile.email': email,
            },
          });
        } catch (e: any) {
          if (e.name !== 'NotFoundError') throw e;
        }
      }

      // 3. Fallback: If no catalog profile exists, let them in anyway!
      const fallbackId = username || email?.split('@')[0] || 'guest';
      return ctx.issueToken({
        claims: {
          sub: `user:default/${fallbackId.toLowerCase()}`,
          ent: [`user:default/${fallbackId.toLowerCase()}`],
        },
      });
    };
  },
});

const customGithubProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'github-provider',

  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },

      async init({ providers }) {
        providers.registerProvider({
          providerId: 'github',

          factory: createOAuthProviderFactory({
            authenticator: githubAuthenticator,

            signInResolverFactories: {
              ...githubSignInResolvers,
              ...commonSignInResolvers,
              enterpriseCustomResolver,
            },
          }),
        });
      },
    });
  },
});

// Auth
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(customGithubProvider);

// Terraform
backend.add(import('@globallogicuki/backstage-plugin-terraform-backend'));

// Catalog
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-github'));

backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// Permission
backend.add(import('@backstage/plugin-permission-backend'));

backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// Search
backend.add(import('@backstage/plugin-search-backend'));

// Search engine
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// Search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// Kubernetes
backend.add(import('@backstage/plugin-kubernetes-backend'));

// User settings
backend.add(import('@backstage/plugin-user-settings-backend'));

// Notifications and signals
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

// MCP Actions
backend.add(import('@backstage/plugin-mcp-actions-backend'));

// Azure DevOps proxy
import { adoProxyPlugin } from './modules/adoProxy';
import { azureDeployProxyPlugin } from './modules/azureDeployProxy';
import { integrationsProxyPlugin } from './modules/integrationsProxy';

backend.add(adoProxyPlugin);
backend.add(azureDeployProxyPlugin);
backend.add(integrationsProxyPlugin);

backend.start();