import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { describe, afterEach, test } from 'node:test'
import { transformAsync } from '@babel/core'

describe('babel-plugin-typescript-resolver', () => {
  afterEach(async () => {
    await fs.rm('tsconfig.json', { force: true })
    await fs.rm('jsconfig.json', { force: true })
    await fs.rm('packages', { recursive: true, force: true })
  })

  test('no filename', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('no config', async () => {
    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('tsconfig with baseUrl', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { baseUrl: './', paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `import 'module';\nimport '@/foo';\nrequire('module');\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(
      code,
      `import 'module';\nimport '@/foo';\nrequire('module');\nrequire('@/foo');`,
    )
  })

  test('jsconfig with baseUrl', async () => {
    await fs.writeFile(
      'jsconfig.json',
      JSON.stringify({
        compilerOptions: { baseUrl: './', paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `import 'module';\nimport '@/foo';\nrequire('module');\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(
      code,
      `import 'module';\nimport '@/foo';\nrequire('module');\nrequire('@/foo');`,
    )
  })

  test('tsconfig without paths', async () => {
    await fs.writeFile('tsconfig.json', JSON.stringify({ compilerOptions: {} }))

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('jsconfig without paths', async () => {
    await fs.writeFile('jsconfig.json', JSON.stringify({ compilerOptions: {} }))

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('tsconfig with multiple paths', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: { '@/*': ['./src/*', './dist/*'] },
        },
      }),
    )

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('jsconfig with multiple paths', async () => {
    await fs.writeFile(
      'jsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: { '@/*': ['./src/*', './dist/*'] },
        },
      }),
    )

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('tsconfig', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: {
            '@/*': ['./src/*'],
            '@generated/*': ['./src/pages/.generated/*'],
          },
        },
      }),
    )

    const { code } = await transformAsync(
      `import 'module';
import '@/foo';
import '@/pages';
import '@/pages/bar';
import '@generated/baz';
import '../foo';
import '.';
import './bar';

export { a } from 'module';
export { b } from '@/foo';
export { c } from '@/pages';
export { d } from '@/pages/bar';
export { e } from '@generated/baz';
export { f } from '../foo';
export { g } from '.';
export { h } from './bar';

export * from 'module';
export * from '@/foo';
export * from '@/pages';
export * from '@/pages/bar';
export * from '@generated/baz';
export * from '../foo';
export * from '.';
export * from './bar';

import('module');
import('@/foo');
import('@/pages');
import('@/pages/bar');
import('@generated/baz');
import('../foo');
import('.');
import('./bar');
import(path);

require('module');
require('@/foo');
require('@/pages');
require('@/pages/bar');
require('@generated/baz');
require('../foo');
require('.');
require('./bar');
require(path);
fn('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(
      code,
      `import 'module';
import "../foo";
import ".";
import "./bar";
import "./.generated/baz";
import '../foo';
import '.';
import './bar';
export { a } from 'module';
export { b } from "../foo";
export { c } from ".";
export { d } from "./bar";
export { e } from "./.generated/baz";
export { f } from '../foo';
export { g } from '.';
export { h } from './bar';
export * from 'module';
export * from "../foo";
export * from ".";
export * from "./bar";
export * from "./.generated/baz";
export * from '../foo';
export * from '.';
export * from './bar';
import('module');
import("../foo");
import(".");
import("./bar");
import("./.generated/baz");
import('../foo');
import('.');
import('./bar');
import(path);
require('module');
require("../foo");
require(".");
require("./bar");
require("./.generated/baz");
require('../foo');
require('.');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('jsconfig', async () => {
    await fs.writeFile(
      'jsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: {
            '@/*': ['./src/*'],
            '@generated/*': ['./src/pages/.generated/*'],
          },
        },
      }),
    )

    const { code } = await transformAsync(
      `import 'module';
import '@/foo';
import '@/pages';
import '@/pages/bar';
import '@generated/baz';
import '../foo';
import '.';
import './bar';

export { a } from 'module';
export { b } from '@/foo';
export { c } from '@/pages';
export { d } from '@/pages/bar';
export { e } from '@generated/baz';
export { f } from '../foo';
export { g } from '.';
export { h } from './bar';

export * from 'module';
export * from '@/foo';
export * from '@/pages';
export * from '@/pages/bar';
export * from '@generated/baz';
export * from '../foo';
export * from '.';
export * from './bar';

import('module');
import('@/foo');
import('@/pages');
import('@/pages/bar');
import('@generated/baz');
import('../foo');
import('.');
import('./bar');
import(path);

require('module');
require('@/foo');
require('@/pages');
require('@/pages/bar');
require('@generated/baz');
require('../foo');
require('.');
require('./bar');
require(path);
fn('@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(
      code,
      `import 'module';
import "../foo";
import ".";
import "./bar";
import "./.generated/baz";
import '../foo';
import '.';
import './bar';
export { a } from 'module';
export { b } from "../foo";
export { c } from ".";
export { d } from "./bar";
export { e } from "./.generated/baz";
export { f } from '../foo';
export { g } from '.';
export { h } from './bar';
export * from 'module';
export * from "../foo";
export * from ".";
export * from "./bar";
export * from "./.generated/baz";
export * from '../foo';
export * from '.';
export * from './bar';
import('module');
import("../foo");
import(".");
import("./bar");
import("./.generated/baz");
import('../foo');
import('.');
import('./bar');
import(path);
require('module');
require("../foo");
require(".");
require("./bar");
require("./.generated/baz");
require('../foo');
require('.');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('local exports', async () => {
    const input = `const foo = 1;
export { foo };
export const bar = 2;
export default foo;`

    const { code } = await transformAsync(input, {
      filename: './src/pages/home.js',
      plugins: ['./index.js'],
    })

    assert.equal(code, input)
  })

  test('dynamic import comments and options', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `import(/* webpackChunkName: "foo" */ '@/foo', { with: { type: 'json' } });`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(
      code,
      `import(/* webpackChunkName: "foo" */"../foo", {
  with: {
    type: 'json'
  }
});`,
    )
  })

  test('require comments', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `require(/* webpackIgnore: true */ '@/foo');`,
      {
        filename: './src/pages/home.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `require(/* webpackIgnore: true */"../foo");`)
  })

  test('nested tsconfig', async () => {
    await fs.writeFile('tsconfig.json', JSON.stringify({ compilerOptions: {} }))
    await fs.mkdir('packages/foo', { recursive: true })
    await fs.writeFile(
      'packages/foo/tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './packages/foo/src/index.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import "./foo";\nrequire("./foo");`)
  })

  test('nested jsconfig', async () => {
    await fs.writeFile('jsconfig.json', JSON.stringify({ compilerOptions: {} }))
    await fs.mkdir('packages/foo', { recursive: true })
    await fs.writeFile(
      'packages/foo/jsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } },
      }),
    )

    const { code } = await transformAsync(
      `import '@/foo';\nrequire('@/foo');`,
      {
        filename: './packages/foo/src/index.js',
        plugins: ['./index.js'],
      },
    )

    assert.equal(code, `import "./foo";\nrequire("./foo");`)
  })
})
