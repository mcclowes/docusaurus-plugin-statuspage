import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

type PackageMetadata = {
  main: string
  module: string
  types: string
  exports: Record<string, { types: string; import: string; require: string }>
}

const repository = resolve(import.meta.dirname, '..')
let directory: string | undefined
let packageRoot: string
let metadata: PackageMetadata

beforeAll(() => {
  directory = realpathSync(mkdtempSync(join(tmpdir(), 'statuspage package ')))
  const stage = join(directory, 'stage')
  mkdirSync(stage)
  for (const file of ['package.json', 'README.md', 'LICENSE']) {
    cpSync(join(repository, file), join(stage, file))
  }
  execFileSync(
    process.execPath,
    [join(repository, 'node_modules/tsup/dist/cli-default.js'), '--out-dir', join(stage, 'dist')],
    { cwd: repository, timeout: 45_000, stdio: 'pipe' }
  )
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--offline', '--ignore-scripts', '--json'], {
      cwd: stage,
      timeout: 30_000,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  ) as Array<{ filename: string }>
  packageRoot = join(directory, 'consumer/node_modules/docusaurus-plugin-statuspage')
  mkdirSync(packageRoot, { recursive: true })
  execFileSync('tar', [
    '-xzf',
    join(stage, packed[0].filename),
    '-C',
    packageRoot,
    '--strip-components=1',
  ])
  metadata = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))
}, 90_000)

afterAll(() => {
  if (directory) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('packed package', () => {
  it('ships every advertised JavaScript and declaration target', () => {
    const targets = new Set([
      metadata.main,
      metadata.module,
      metadata.types,
      ...Object.values(metadata.exports).flatMap((entry) => Object.values(entry)),
    ])

    expect([...targets].filter((target) => !existsSync(join(packageRoot, target)))).toEqual([])
  })

  it('loads root and client exports in cold ESM and CommonJS consumers', () => {
    const consumer = join(packageRoot, '../..')
    const script = join(consumer, 'check.mjs')
    writeFileSync(
      script,
      `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      import { join } from 'node:path';
      import esmFactory from 'docusaurus-plugin-statuspage';
      import * as esmClient from 'docusaurus-plugin-statuspage/client';
      const require = createRequire(import.meta.url);
      const cjs = require('docusaurus-plugin-statuspage');
      const cjsClient = require('docusaurus-plugin-statuspage/client');
      for (const [factory, client] of [[esmFactory, esmClient], [cjs.default ?? cjs, cjsClient]]) {
        assert.equal(typeof factory, 'function');
        assert.equal(typeof client.onRouteDidUpdate, 'function');
        const plugin = factory({}, { statuspageUrl: 'https://example.invalid' });
        assert.equal(plugin.name, 'docusaurus-plugin-statuspage');
        const modules = plugin.getClientModules();
        assert.equal(modules.length, 1);
        assert.equal(require.resolve(modules[0]), join(${JSON.stringify(packageRoot)}, 'dist/client/index.js'));
      }
      process.stdout.write('root/client ESM/CommonJS imports and client-module resolution passed');
    `
    )
    const output = execFileSync(process.execPath, [script], {
      cwd: consumer,
      timeout: 10_000,
      encoding: 'utf8',
    })

    expect(output).toBe('root/client ESM/CommonJS imports and client-module resolution passed')
  })
})
