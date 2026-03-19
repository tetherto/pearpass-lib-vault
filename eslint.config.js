import { eslintConfig } from '@tetherto/tether-dev-docs'

export default [
  ...eslintConfig,
  {
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^React$',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  }
]
