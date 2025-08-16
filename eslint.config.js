import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  typescript: true,
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
})
