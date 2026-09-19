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
