# babel-plugin-typescript-resolver

A babel plugin that transforms path aliases configured in `tsconfig.json` or `jsconfig.json` into relative paths. This plugin uses [get-tsconfig](https://github.com/privatenumber/get-tsconfig) under the hood.

### ⚠️ Unsupported patterns

```json
{
  "compilerOptions": {
    "baseUrl": ".", // ❌ baseUrl is NOT supported!
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./path/*", "./another-path/*"] // ❌ Multiple paths is NOT supported!
    }
  }
}
```

### Supported pattern

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### In

```js
// src/pages/home.js

import utils from '@/utils'

export { isArray } from '@/utils'

export * from '@/utils'

import('@/utils')

require('@/utils')
```

### Out

```js
// src/pages/home.js

import utils from '../utils'

export { isArray } from '../utils'

export * from '../utils'

import('../utils')

require('../utils')
```

## Installation

```sh
npm install babel-plugin-typescript-resolver --save-dev
```

## Usage

`babel.config.js`

```js
const config = {
  plugins: [
    'typescript-resolver',
    // other plugins
  ],
}

export default config
```

## License

[MIT](https://opensource.org/licenses/MIT)
