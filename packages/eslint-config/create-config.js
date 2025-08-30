import antfu from "@antfu/eslint-config";

export default function createConfig(options, ...userConfigs) {
  return antfu({
    type: "app",
    // Enable stylistic formatting rules
    stylistic: {
      indent: 2,
      semi: true,
      quotes: 'single',
    },
    ...options,
    // TypeScript and Vue are autodetected, you can also explicitly enable them:
    typescript: true,

    // Disable jsonc and yaml support
    jsonc: false,
    yaml: false,

    ignores: [
      "**/fixtures",'node_modules', 'dist', 'build'
    ],
    
    unicorn: {
      overrides: {
        'unicorn/filename-case': [
          'error',
          {
            case: 'kebabCase',
            ignore: ['^.*\\.d\\.ts$'],
          },
        ],
      },
    },
    ...userConfigs,
  },
  );
}
