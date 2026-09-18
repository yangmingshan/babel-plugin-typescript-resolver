# babel-plugin-typescript-resolver

A babel plugin that transforms path aliases configured in `tsconfig.json` or `jsconfig.json` into relative paths. This plugin uses [get-tsconfig](https://github.com/privatenumber/get-tsconfig) under the hood.

### ⚠️ Multiple paths is not supported

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./path/*", "./another-path/*"] // ❌ NOT supported!
    }
  }
}
```

### Make sure only map to one path

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"] // ✅ Supported!
    }
  }
}
```

### In

```js
// src/pages/home.js

import utils from '@/utils'

require('@/utils')
```

### Out

```js
// src/pages/home.js

import utils from '../utils'

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
