const config = {
  '**/*.js': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint ${filenames.join(' ')}`,
  ],
  '**/*.json': (filenames) => [`prettier --write ${filenames.join(' ')}`],
  '**/*.md': (filenames) => [`prettier --write ${filenames.join(' ')}`],
}

export default config
