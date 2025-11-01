/* eslint-disable node/prefer-global/process */

import type { NodePlopAPI } from 'plop';
import fs from 'node:fs';
import path from 'node:path';

export default function (plop: NodePlopAPI) {
  // Custom helpers
  plop.setHelper('httpMethod', (action: string) => {
    const methodMap: Record<string, string> = {
      list: 'get',
      getById: 'get',
      create: 'post',
      update: 'patch',
      replace: 'put',
      delete: 'delete',
    };
    return methodMap[action] || 'get';
  });

  plop.setHelper('plural', (name: string) => {
    if (name.endsWith('s'))
      return name;
    return `${name}s`;
  });

  // Custom action to manually inject import
  plop.setActionType('injectImport', (answers, config, plop) => {
    const filePath = plop.renderString(config?.filePath || '', answers);
    const importStatement = plop.renderString(config?.importStatement || '', answers);

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if import already exists
    if (content.includes(importStatement.trim())) {
      return 'Import already exists';
    }

    // Find the last import statement
    const importRegex = /^import\s+(?:\S.*)?from\s+['"].*['"];?\s*$/gm;
    const matches = [...content.matchAll(importRegex)];

    if (matches.length > 0) {
      const lastImport = matches[matches.length - 1];
      const insertPosition = lastImport.index! + lastImport[0].length;

      content = `${content.slice(0, insertPosition)}\n${importStatement}${content.slice(insertPosition)}`;
      fs.writeFileSync(filePath, content);
      return 'Import injected successfully';
    }

    return 'Failed to find import statements';
  });

  // Custom action to manually inject route
  plop.setActionType('injectRoute', (answers, config, plop) => {
    const filePath = plop.renderString(config?.filePath || '', answers);
    const routeStatement = plop.renderString(config?.routeStatement || '', answers);

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if route already exists
    if (content.includes(routeStatement.trim())) {
      return 'Route already exists';
    }

    // Find the last .route() call before the closing semicolon
    const routeRegex = /\.route\([^)]+\)/g;
    const matches = [...content.matchAll(routeRegex)];

    if (matches.length > 0) {
      const lastRoute = matches[matches.length - 1];
      const insertPosition = lastRoute.index! + lastRoute[0].length;

      content = `${content.slice(0, insertPosition)}\n    ${routeStatement}${content.slice(insertPosition)}`;
      fs.writeFileSync(filePath, content);
      return 'Route injected successfully';
    }

    return 'Failed to find route statements';
  });

  // Full CRUD Generator
  plop.setGenerator('crud', {
    description: 'Generate full CRUD routes (all 5 operations)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g., game-room, user, post):',
        validate: (value: string) => {
          if (!value)
            return 'Name is required';
          return true;
        },
      },
    ],
    actions: [
      // 1. Generate schemas.ts
      {
        type: 'add',
        path: 'src/routes/{{kebabCase name}}/schemas.ts',
        templateFile: 'plop-templates/schemas.hbs',
      },
      // 2. Generate routes.ts (with all 5 CRUD routes)
      {
        type: 'add',
        path: 'src/routes/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
        templateFile: 'plop-templates/crud-routes.hbs',
      },
      // 3. Generate handlers.ts (with all 5 handlers)
      {
        type: 'add',
        path: 'src/routes/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
        templateFile: 'plop-templates/crud-handlers.hbs',
      },
      // 4. Generate index.ts (router setup)
      {
        type: 'add',
        path: 'src/routes/{{kebabCase name}}/{{kebabCase name}}.index.ts',
        templateFile: 'plop-templates/crud-index.hbs',
      },
      // 5. Inject import
      {
        type: 'injectImport',
        filePath: 'src/routes/index.ts',
        importStatement: 'import {{camelCase name}} from \'./{{kebabCase name}}/{{kebabCase name}}.index\';',
      },
      // 6. Inject route
      {
        type: 'injectRoute',
        filePath: 'src/routes/index.ts',
        routeStatement: '.route(\'/{{kebabCase name}}\', {{camelCase name}})',
      },
    ],
  });

  // Single Route Generator
  plop.setGenerator('route', {
    description: 'Generate a single route (list, getById, create, update, or delete)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g., game-room):',
        validate: (value: string) => {
          if (!value)
            return 'Name is required';
          return true;
        },
      },
      {
        type: 'list',
        name: 'action',
        message: 'Select action:',
        choices: [
          { name: 'List (GET /resource)', value: 'list' },
          { name: 'Get By ID (GET /resource/:id)', value: 'getById' },
          { name: 'Create (POST /resource)', value: 'create' },
          { name: 'Update (PATCH /resource/:id)', value: 'update' },
          { name: 'Replace (PUT /resource/:id)', value: 'replace' },
          { name: 'Delete (DELETE /resource/:id)', value: 'delete' },
        ],
      },
      {
        type: 'confirm',
        name: 'createSchemas',
        message: 'Create schemas.ts file?',
        default: true,
        when: (answers) => {
          const schemasPath = path.join(
            process.cwd(),
            'src/routes',
            plop.getHelper('kebabCase')(answers.name),
            'schemas.ts',
          );
          return !fs.existsSync(schemasPath);
        },
      },
    ],
    actions: (data) => {
      const actions: any[] = [];

      // Create schemas if needed
      if (data?.createSchemas) {
        actions.push({
          type: 'add',
          path: 'src/routes/{{kebabCase name}}/schemas.ts',
          templateFile: 'plop-templates/schemas.hbs',
        });
      }

      // Add route, handler, and update index
      actions.push(
        // Append to routes.ts
        {
          type: 'append',
          path: 'src/routes/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
          templateFile: 'plop-templates/single-route.hbs',
          skip: (data: { name: any }) => {
            const routesPath = path.join(
              process.cwd(),
              'src/routes',
              plop.getHelper('kebabCase')(data.name),
              `${plop.getHelper('kebabCase')(data.name)}.routes.ts`,
            );
            if (!fs.existsSync(routesPath)) {
              return 'Routes file does not exist. Please use CRUD generator first or create the file manually.';
            }
            return false;
          },
        },
        // Append to handlers.ts
        {
          type: 'append',
          path: 'src/routes/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
          templateFile: 'plop-templates/single-handler.hbs',
        },
        // Append to index.ts
        {
          type: 'modify',
          path: 'src/routes/{{kebabCase name}}/{{kebabCase name}}.index.ts',
          pattern: /(const router = createRouter\(\)[\s\S]*?)(\n\nexport default router;)/,
          template: '$1\n  .openapi({{action}}{{pascalCase name}}{{#if (eq action "list")}}s{{/if}}, {{action}}{{pascalCase name}}{{#if (eq action "list")}}s{{/if}}Handler)$2',
        },
      );

      return actions;
    },
  });
}
