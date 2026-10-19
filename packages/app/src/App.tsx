import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import githubActionsPlugin from '@backstage-community/plugin-github-actions/alpha';
import { SignInPage } from '@backstage/core-components';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { createFrontendModule } from '@backstage/frontend-plugin-api';


const signInModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    SignInPageBlueprint.make({
      params: {
        loader: async () => props => (
          <SignInPage
            {...props}
            providers={[
              {
                id: 'github-auth-provider',
                title: 'GitHub',
                message: 'Sign in using GitHub',
                apiRef: githubAuthApiRef,
              },
            ]}
          />
        ),
      },
    }),
  ],
});

import { adoWorkItemPickerModule } from './components/scaffolder/AdoWorkItemPicker';
import { azureDeployPickersModule } from './components/scaffolder/AzureDeployPickers';

// Unused plugins commented/removed for clean enterprise demo overview
// import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
// import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
// import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import notificationsPlugin from '@backstage/plugin-notifications/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import { datadogConvertedPlugin } from './modules/datadog';
import { jiraConvertedPlugin, prsConvertedPlugin } from './modules/community-tabs';
import { githubReadmeModule } from './modules/github-readme';
import { customTranslationsModule } from './modules/translations';
import { dashboardModule } from './modules/dashboard';
import { azureCatalogModule } from './modules/azure';

export default createApp({
  features: [
    customTranslationsModule,
    githubReadmeModule,
    catalogPlugin, 
    navModule, 
    homeModule, 
    dashboardModule,
    jiraConvertedPlugin,
    prsConvertedPlugin,
    azureCatalogModule,
    datadogConvertedPlugin,
    techdocsPlugin,
    signInModule, 
    adoWorkItemPickerModule,
    azureDeployPickersModule,
    notificationsPlugin,
    searchPlugin,
    userSettingsPlugin,
    scaffolderPlugin,
    catalogImportPlugin,
  ],
});
