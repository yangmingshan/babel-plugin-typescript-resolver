import globals from 'globals'
import eslint from '@eslint/js'

const config = [
  { ignores: ['test-files/'] },
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      ...eslint.configs.recommended.rules,
      // Avoid conflicts with Prettier
      // https://github.com/prettier/eslint-config-prettier#no-unexpected-multiline
      'no-unexpected-multiline': 'off',
    },
  },
]

export default config
