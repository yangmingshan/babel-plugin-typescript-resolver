import { describe, afterEach, test } from 'node:test'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { transformSync, transformFileAsync } from '@babel/core'

describe('babel-plugin-typescript-resolver', () => {
  afterEach(async () => {
    try {
      await fs.rm('tsconfig.json')
    } catch {
      // ignore
    }
    try {
      await fs.rm('test-files/tsconfig.json')
    } catch {
      // ignore
    }
    try {
      await fs.rm('jsconfig.json')
    } catch {
      // ignore
    }
    try {
      await fs.rm('test-files/jsconfig.json')
    } catch {
      // ignore
    }
  })

  test('no config', async () => {
    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import '@/foo';
import '@/home';
import '@/home/bar';
import '../foo';
import './bar';
require('module');
require('@/foo');
require('@/home');
require('@/home/bar');
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('tsconfig without paths', async () => {
    await fs.writeFile('tsconfig.json', JSON.stringify({ compilerOptions: {} }))

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import '@/foo';
import '@/home';
import '@/home/bar';
import '../foo';
import './bar';
require('module');
require('@/foo');
require('@/home');
require('@/home/bar');
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('jsconfig without paths', async () => {
    await fs.writeFile('jsconfig.json', JSON.stringify({ compilerOptions: {} }))

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import '@/foo';
import '@/home';
import '@/home/bar';
import '../foo';
import './bar';
require('module');
require('@/foo');
require('@/home');
require('@/home/bar');
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('tsconfig with multiple paths', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: { '@/*': ['./test-files/*', './another-path/*'] },
        },
      }),
    )

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import '@/foo';
import '@/home';
import '@/home/bar';
import '../foo';
import './bar';
require('module');
require('@/foo');
require('@/home');
require('@/home/bar');
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('jsconfig with multiple paths', async () => {
    await fs.writeFile(
      'jsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: { '@/*': ['./test-files/*', './another-path/*'] },
        },
      }),
    )

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import '@/foo';
import '@/home';
import '@/home/bar';
import '../foo';
import './bar';
require('module');
require('@/foo');
require('@/home');
require('@/home/bar');
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('no filename', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./test-files/*'] } },
      }),
    )

    const { code } = transformSync(`import '@/foo';\nrequire('@/foo');`, {
      plugins: ['./index.js'],
    })
    assert.equal(code, `import '@/foo';\nrequire('@/foo');`)
  })

  test('tsconfig', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./test-files/*'] } },
      }),
    )

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import "../foo";
import ".";
import "./bar";
import '../foo';
import './bar';
require('module');
require("../foo");
require(".");
require("./bar");
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('jsconfig', async () => {
    await fs.writeFile(
      'jsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./test-files/*'] } },
      }),
    )

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import "../foo";
import ".";
import "./bar";
import '../foo';
import './bar';
require('module');
require("../foo");
require(".");
require("./bar");
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('nested tsconfig', async () => {
    await fs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./test-files/*'] } },
      }),
    )

    await fs.writeFile(
      'test-files/tsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./home/*'] } },
      }),
    )

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import "./foo";
import "./home";
import "./home/bar";
import '../foo';
import './bar';
require('module');
require("./foo");
require("./home");
require("./home/bar");
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })

  test('nested jsconfig', async () => {
    await fs.writeFile(
      'jsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./test-files/*'] } },
      }),
    )
    await fs.writeFile(
      'test-files/jsconfig.json',
      JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./home/*'] } },
      }),
    )

    const { code } = await transformFileAsync('./test-files/home/page.js', {
      plugins: ['./index.js'],
    })

    assert.equal(
      code,
      `import 'module';
import "./foo";
import "./home";
import "./home/bar";
import '../foo';
import './bar';
require('module');
require("./foo");
require("./home");
require("./home/bar");
require('../foo');
require('./bar');
require(path);
fn('@/foo');`,
    )
  })
})
