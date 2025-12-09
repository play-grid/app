import antfu from '@antfu/eslint-config';

export default function createConfig(options, ...userConfigs) {
  return antfu({
    type: 'app',
    stylistic: {
      indent: 2,
      semi: true,
      quotes: 'single',
    },
    ...options,
    typescript: true,

    jsonc: false,
    yaml: false,
    ignores: ['**/fixtures', 'node_modules', 'dist', 'build', '**/*.md'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
    },
    unicorn: {
      overrides: {
        'unicorn/filename-case': [
          'error',
          {
            case: 'kebabCase',
            ignore: ['^.*\\.d\\.ts$', 'README\\.md'],
          },
        ],
      },
    },
    ...userConfigs,
  },
  );
}
