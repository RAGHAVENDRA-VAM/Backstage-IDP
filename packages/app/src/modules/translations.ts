import { createFrontendModule, createTranslationMessages } from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { catalogTranslationRef } from '@backstage/plugin-catalog/alpha';

export const customTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    TranslationBlueprint.make({
      name: 'catalog-title-override',
      params: {
        resource: createTranslationMessages({
          ref: catalogTranslationRef,
          messages: {
            'indexPage.title': 'Any Insurance Company',
          },
        }),
      },
    }),
  ],
});
