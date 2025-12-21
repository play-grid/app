import type { PlopTypes } from '@turbo/gen';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

interface CustomConfig {
  filePath?: string;
  importStatement?: string;
  routeStatement?: string;
}

export default function (plop: PlopTypes.NodePlopAPI) {
  const generatorRoot = path.join(__dirname);

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

  plop.setHelper('eq', (a: any, b: any) => a === b);

  plop.setHelper('or', (...args: any[]) => {
    return args.slice(0, -1).some(Boolean) as any;
  });

  // Custom action to manually inject import
  plop.setActionType('injectImport', (answers: any, config: any, plop: any) => {
    if (!plop) {
      return 'Plop instance is undefined';
    }

    const customConfig = config as CustomConfig;
    const filePath = path.join(process.cwd(), plop.renderString(customConfig?.filePath || '', answers));
    const importStatement = plop.renderString(customConfig?.importStatement || '', answers);

    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(importStatement.trim())) {
      return 'Import already exists';
    }

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
  plop.setActionType('injectRoute', (answers: any, config: any, plop: any) => {
    if (!plop) {
      return 'Plop instance is undefined';
    }

    const customConfig = config as CustomConfig;
    const filePath = path.join(process.cwd(), plop.renderString(customConfig?.filePath || '', answers));
    const routeStatement = plop.renderString(customConfig?.routeStatement || '', answers);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes(routeStatement.trim())) {
      return 'Route already exists';
    }

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
        default: 'apps/api/src/routes',
      },
    ],
    actions: [
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/schemas.ts',
        templateFile: path.join(generatorRoot, 'templates/crud-schemas.hbs'),
      },
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
        templateFile: path.join(generatorRoot, 'templates/crud-routes.hbs'),
      },
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
        templateFile: path.join(generatorRoot, 'templates/crud-handlers.hbs'),
      },
      {
        type: 'add',
        path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.index.ts',
        templateFile: path.join(generatorRoot, 'templates/crud-index.hbs'),
      },
      {
        type: 'injectImport' as any,
        filePath: '{{modulePath}}/index.ts',
        importStatement: 'import {{camelCase name}} from \'./{{kebabCase name}}/{{kebabCase name}}.index\';',
      } as any,
      {
        type: 'injectRoute' as any,
        filePath: '{{modulePath}}/index.ts',
        routeStatement: '.route(\'/{{kebabCase name}}\', {{camelCase name}})',
      } as any,
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
        default: 'apps/api/src/routes',
      },
      {
        type: 'confirm',
        name: 'createFiles',
        message: 'Resource files don\'t exist. Create them?',
        default: true,
        when: (answers: any) => {
          const routesPath = path.join(
            process.cwd(),
            answers.modulePath as string,
            plop.getHelper('kebabCase')(answers.name as string),
            `${plop.getHelper('kebabCase')(answers.name as string)}.routes.ts`,
          );
          return !fs.existsSync(routesPath);
        },
      },
    ],
    actions: (data: any) => {
      const actions: any[] = [];

      const routesPath = path.join(
        process.cwd(),
        (data?.modulePath as string) || 'apps/api/src/routes',
        plop.getHelper('kebabCase')((data?.name as string) || ''),
        `${plop.getHelper('kebabCase')((data?.name as string) || '')}.routes.ts`,
      );

      const filesExist = fs.existsSync(routesPath);

      if (!filesExist && data?.createFiles) {
        actions.push(
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/schemas.ts',
            templateFile: path.join(generatorRoot, 'templates/minimal-schema.hbs'),
          },
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
            template: `import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent{{#if (or (eq action "create") (eq action "update") (eq action "replace"))}}, jsonContentRequired{{/if}} } from 'stoker/openapi/helpers';

const tags = ['{{pascalCase name}}'];
`,
          },
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
            template: `import type { AppRouteHandler } from '@/lib/types';
`,
          },
          {
            type: 'add',
            path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.index.ts',
            template: `import createRouter from '@/lib/create-router';

const router = createRouter();

export default router;
`,
          },
          {
            type: 'injectImport' as any,
            filePath: '{{modulePath}}/index.ts',
            importStatement: 'import {{camelCase name}} from \'./{{kebabCase name}}/{{kebabCase name}}.index\';',
          } as any,
          {
            type: 'injectRoute' as any,
            filePath: '{{modulePath}}/index.ts',
            routeStatement: '.route(\'/{{kebabCase name}}\', {{camelCase name}})',
          } as any,
        );
      }
      else if (filesExist) {
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
        {
          type: 'append',
          path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.routes.ts',
          templateFile: path.join(generatorRoot, 'templates/single-route.hbs'),
        },
        {
          type: 'append',
          path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.handlers.ts',
          templateFile: path.join(generatorRoot, 'single-handler.hbs'),
        },
        {
          type: 'modify',
          path: '{{modulePath}}/{{kebabCase name}}/{{kebabCase name}}.index.ts',
          transform: (fileContent: any, answers: any) => {
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
