import type { AppOpenAPI } from './types';

import { Scalar } from '@scalar/hono-api-reference';

import packageJSON from '../../package.json' with { type: 'json' };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/doc', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: 'Guess Logo API',
    },
  });

  app.doc('/auth/open-api/generate-schema', {
    openapi: '3.0.0',
    info: {
      version: packageJSON.version,
      title: 'Auth API',
    },
  });

  app.get(
    '/reference',
    Scalar({
      pageTitle: 'API Documentation',
      layout: 'modern',
      defaultOpenAllTags: true,
      theme: 'bluePlanet',
      expandAllResponses: true,
      hideClientButton: false,
      showSidebar: true,
      operationTitleSource: 'summary',
      persistAuth: false,
      telemetry: true,
      isEditable: false,
      isLoading: false,
      hideModels: false,
      documentDownloadType: 'both',
      hideTestRequestButton: false,
      hideSearch: false,
      hideDarkModeToggle: false,
      withDefaultFonts: true,
      expandAllModelSections: false,
      orderSchemaPropertiesBy: 'alpha',
      orderRequiredPropertiesFirst: true,
      _integration: 'hono',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
      sources: [{ url: '/api/doc' }, { url: '/api/auth/open-api/generate-schema', title: 'Auth' }],
    }),
  );
}
