# Docusaurus Plugin: Statuspage banner

Displays a discreet banner on initial page load if your public `statuspage.io` reports degraded service or ongoing incidents. Links users to your Statuspage for more details.

## Quick start

```bash
# Install deps
npm install

# Build once
npm run build

# Watch and rebuild on change
npm run dev
```

## Install into a local Docusaurus site

From your Docusaurus site:

```bash
# Using a local path during development
npm install ../path/to/docusaurus-plugin-statuspage

# Or via a temporary tarball
npm pack ../path/to/docusaurus-plugin-statuspage
npm install ./docusaurus-plugin-statuspage-*.tgz
```

Add to `docusaurus.config.js` or `docusaurus.config.ts`:

```js
// docusaurus.config.js
module.exports = {
  // ... existing config ...
  plugins: [
    [
      'docusaurus-plugin-statuspage',
      {
        statuspageUrl: 'https://acme.statuspage.io',
        // optional
        enabled: true,
        position: 'bottom-left', // 'bottom-right' | 'top-left' | 'top-right'
        linkLabel: 'View status'
      }
    ]
  ]
}
```

Access global data set by the plugin from any theme component:

```js
// Example React component
import React from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function StatusInfo() {
  const { globalData } = useDocusaurusContext()
  const data = globalData['docusaurus-plugin-statuspage']?.default
  return <div>{data?.statuspageUrl}</div>
}
```

## How it works

On build, the plugin injects a small `<meta name="docusaurus-statuspage" ...>` tag with your configured URL and options. On the client, a lightweight script fetches `GET {statuspageUrl}/api/v2/summary.json` and, if the `status.indicator` is not `none` or there are ongoing incidents, renders a small, dismissible banner that links to Statuspage.

## Extend the plugin

Common additions:

- Add plugin options: extend `StatuspagePluginOptions` in `src/types.ts`
- Adjust client behavior or styling in `src/client/index.ts`

Example: add a simple route

```ts
// In src/plugin.ts inside contentLoaded
async contentLoaded({ actions }) {
  const { addRoute } = actions
  addRoute({
    path: '/hello-plugin',
    component: require.resolve('./client/HelloPage')
  })
}
```

Then create `src/client/HelloPage.tsx` and export a React component. The path will be available at `/hello-plugin` when the site runs.

## Publish to npm

1. Update metadata in `package.json`:
   - name: `@yourscope/docusaurus-plugin-statuspage`
   - version: semantic version
   - description, repository, author, homepage, bugs
2. Build the package:
   ```bash
   npm run build
   ```
3. Login and publish:
   ```bash
   npm login
   npm publish --access public
   ```

Notes:
- The published package includes only `dist/`, `README.md`, and `LICENSE` (see `files` and `.npmignore`).
- `prepublishOnly` ensures a fresh build.

## Conventions and tips

- Keep server-only code (Node.js) out of `src/client`.
- Feature-flag behavior via `enabled` or other options.
- Prefer `setGlobalData` over ad-hoc globals.
- Use `peerDependencies` for `@docusaurus/types` to avoid duplicate installs.

## API surface

- Default export: the plugin function `(context, options) => Plugin`
- Types: `StatuspagePluginOptions`
- Client module: `client/index` with `onClientEntry` implementation

## For AI assistants (Cursor, Claude, Codex/GPT)

- What is Docusaurus?
  - Docusaurus is a React/MDX static site generator. A "plugin" runs during build/serve in Node.js and can:
    - Load content (files, data sources)
    - Create routes/pages and inject global data
    - Provide client modules that run in the browser
    - Optionally provide theme components (UI) for the site

- How to build a plugin here
  - Implement or extend logic in `src/plugin.ts` using Docusaurus `Plugin` hooks:
    - `loadContent()` → read/process data at build time
    - `contentLoaded({content, actions})` → create routes or set global data
    - `getClientModules()` → return paths to client-side modules
    - Optional hooks include `getThemePath()`, `getTypeScriptThemePath()`, `configureWebpack()`
  - Define and export typed options in `src/types.ts` and re-export from `src/index.ts`
  - Ensure new client code lives under `src/client/` and uses browser-safe APIs

- How to test locally
  - Link into a Docusaurus site with `npm install ../path` or `npm pack`
  - Inspect generated routes and `globalData` via `@docusaurus/useDocusaurusContext`

- Publishing checklist
  - Update `package.json` metadata, run `npm run build`, then `npm publish --access public`
  - Consider adding CI release automation (e.g., Changesets) later

- Guardrails for assistants
  - Do not import server-only modules into `src/client/*`
  - Keep plugin entry point at `src/index.ts` and default export the plugin
  - Preserve ESM/CJS dual output in `package.json` `exports`
  - Update `tsup.config.ts` entries if new entry points are added

## License

MIT

