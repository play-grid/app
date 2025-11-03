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

  plop.setHelper('eq', (a, b) => a === b);

  plop.setHelper('or', (...args) => {
    // The last argument is the Handlebars options object, ignore it
    return args.slice(0, -1).some(Boolean);
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
      {
        type: 'input',
        name: 'modulePath',
        message: 'Module path for the resource:',
        default: 'src/routes',
      },
    ],
    actions: [
      // 1. Generate schemas.ts
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/schemas.ts',
        templateFile: 'plop-templates/crud-schemas.hbs',
      },
      // 2. Generate routes.ts (with all 5 CRUD routes)
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
        templateFile: 'plop-templates/crud-routes.hbs',
      },
      // 3. Generate handlers.ts (with all 5 handlers)
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
        templateFile: 'plop-templates/crud-handlers.hbs',
      },
      // 4. Generate index.ts (router setup)
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.index.ts',
        templateFile: 'plop-templates/crud-index.hbs',
      },
      // 5. Inject import
      {
        type: 'injectImport',
        filePath: '{{modulePath}}/index.ts',
        importStatement: 'import {{camelCase name}} from \'./{{kebabCase name}}/{{kebabCase name}}.index\';',
      },
      // 6. Inject route
      {
        type: 'injectRoute',
        filePath: '{{modulePath}}/index.ts',
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
        type: 'input',
        name: 'modulePath',
        message: 'Module path for the resource:',
        default: 'src/routes',
        when: answers => !answers.modulePath,
      },
      {
        type: 'confirm',
        name: 'createFiles',
        message: 'Resource files don\'t exist. Create them?',
        default: true,
        when: (answers) => {
          const routesPath = path.join(
            process.cwd(),
            answers.modulePath,
            plop.getHelper('kebabCase')(answers.name),
            `${plop.getHelper('kebabCase')(answers.name)}.routes.ts`,
          );
          return !fs.existsSync(routesPath);
        },
      },
    ],
    actions: (data) => {
      const actions: any[] = [];

      const routesPath = path.join(
        process.cwd(),
        data?.modulePath || 'src/routes',
        plop.getHelper('kebabCase')(data?.name || ''),
        `${plop.getHelper('kebabCase')(data?.name || '')}.routes.ts`,
      );

      const filesExist = fs.existsSync(routesPath);

      // If files don't exist, create them
      if (!filesExist && data?.createFiles) {
        actions.push(
          // Create minimal schema based on action
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/schemas.ts',
            templateFile: 'plop-templates/minimal-schema.hbs',
          },
          // Create routes file with proper imports based on action
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
            template: `import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent{{#if (or (eq action "create") (eq action "update") (eq action "replace"))}}, jsonContentRequired{{/if}} } from 'stoker/openapi/helpers';

const tags = ['{{pascalCase name}}'];
`,
          },
          // Create empty handlers file
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
            template: `import type { AppRouteHandler } from '@/lib/types';
`,
          },
          // Create empty index file
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.index.ts',
            template: `import createRouter from '@/lib/create-router';

const router = createRouter();

export default router;
`,
          },
          // Inject import
          {
            type: 'injectImport',
            filePath: '{{modulePath}}/index.ts',
            importStatement: 'import {{camelCase name}} from \'./{{kebabCase name}}/{{kebabCase name}}.index\';',
          },
          // Inject route
          {
            type: 'injectRoute',
            filePath: '{{modulePath}}/index.ts',
            routeStatement: '.route(\'/{{kebabCase name}}\', {{camelCase name}})',
          },
        );
      }
      else if (filesExist) {
        // Files exist, append new schema if needed
        actions.push({
          type: 'append',
          path: '{{modulePath}}/{{kebabCase name}}/schemas.ts',
          template: `
{{#if (eq action "create")}}
// Input schema for creating
export const create{{pascalCase name}}InputSchema = {{camelCase name}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
{{/if}}
{{#if (eq action "update")}}
// Input schema for updating
export const update{{pascalCase name}}InputSchema = {{camelCase name}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();
{{/if}}
{{#if (eq action "replace")}}
// Input schema for replacing
export const replace{{pascalCase name}}InputSchema = {{camelCase name}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
{{/if}}
{{#if (eq action "list")}}
// List output schema
export const list{{pascalCase name}}sOutputSchema = z.array({{camelCase name}}OutputSchema);
{{/if}}`,
          skip: (data: { name: any; action: string; modulePath: string }) => {
            // Check if schema already exists
            const schemasPath = path.join(
              process.cwd(),
              data.modulePath,
              plop.getHelper('kebabCase')(data.name),
              'schemas.ts',
            );
            const content = fs.readFileSync(schemasPath, 'utf8');

            if (data.action === 'create' && content.includes('create{{pascalCase name}}InputSchema')) {
              return 'Schema already exists';
            }
            if (data.action === 'update' && content.includes('update{{pascalCase name}}InputSchema')) {
              return 'Schema already exists';
            }
            if (data.action === 'replace' && content.includes('replace{{pascalCase name}}InputSchema')) {
              return 'Schema already exists';
            }
            if (data.action === 'list' && content.includes('list{{pascalCase name}}sOutputSchema')) {
              return 'Schema already exists';
            }
            return false;
          },
        });
      }

      // Add the single route
      actions.push(
        // Append to routes.ts
        {
          type: 'append',
          path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
          templateFile: 'plop-templates/single-route.hbs',
        },
        // Append to handlers.ts
        {
          type: 'append',
          path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
          templateFile: 'plop-templates/single-handler.hbs',
        },
        // Update index.ts to add the route
        {
          type: 'modify',
          path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.index.ts',
          transform: (fileContent, answers) => {
            const { name, action } = answers;
            const pascalCaseName = plop.getHelper('pascalCase')(name);
            const kebabCaseName = plop.getHelper('kebabCase')(name);

            const routeName = action === 'list'
              ? `${action}${pascalCaseName}s`
              : `${action}${pascalCaseName}`;

            const routeImport = `import { ${routeName} } from './${kebabCaseName}.routes';`;
            const handlerImport = `import { ${routeName}Handler } from './${kebabCaseName}.handlers';`;

            let newContent = fileContent;
            if (!newContent.includes(routeImport)) {
              newContent = newContent.replace(
                /(import createRouter from .*\n)/,
                `$1${routeImport}\n`,
              );
            }
            if (!newContent.includes(handlerImport)) {
              newContent = newContent.replace(
                /(import createRouter from .*\n)/,
                `$1${handlerImport}\n`,
              );
            }

            newContent = newContent.replace(
              /(const router = createRouter\(\);)/,
              `$1\n  .openapi(${routeName}, ${routeName}Handler)`,
            );

            return newContent;
          },
        },
      );

      return actions;
    },
  });
}
