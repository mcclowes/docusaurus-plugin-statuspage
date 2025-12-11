# Docusaurus Plugin: Statuspage banner

[![CI](https://github.com/mcclowes/docusaurus-plugin-statuspage/actions/workflows/ci.yml/badge.svg)](https://github.com/mcclowes/docusaurus-plugin-statuspage/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/docusaurus-plugin-statuspage.svg)](https://badge.fury.io/js/docusaurus-plugin-statuspage)

Displays a discreet banner on initial page load if your public `statuspage.io` reports degraded service or ongoing incidents. Links users to your Statuspage for more details.

## Installation

```bash
npm install docusaurus-plugin-statuspage
```

## Configuration

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
        linkLabel: 'View status',
      },
    ],
  ],
}
```

## Options

| Option          | Type      | Default         | Description                                                                     |
| --------------- | --------- | --------------- | ------------------------------------------------------------------------------- |
| `statuspageUrl` | `string`  | **required**    | Your Statuspage.io URL (e.g., `https://acme.statuspage.io`)                     |
| `enabled`       | `boolean` | `true`          | Enable or disable the plugin                                                    |
| `position`      | `string`  | `'bottom-left'` | Banner position: `'bottom-left'`, `'bottom-right'`, `'top-left'`, `'top-right'` |
| `linkLabel`     | `string`  | `'View status'` | Text for the link to your status page                                           |

## How it works

On build, the plugin injects a small `<meta name="docusaurus-statuspage" ...>` tag with your configured URL and options. On the client, a lightweight script fetches `GET {statuspageUrl}/api/v2/summary.json` and, if the `status.indicator` is not `none` or there are ongoing incidents, renders a small, dismissible banner that links to Statuspage.

### Features

- Displays a discreet, dismissible banner
- Automatically fetches status from Statuspage.io API
- Persists dismissed banners per incident using localStorage
- Configurable position
- Respects Docusaurus theme variables for consistent styling
- Accessible with ARIA labels and semantic HTML

## Development

### Quick start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build once
npm run build

# Watch and rebuild on change
npm run dev
```

### Run the example site

```bash
npm run example:start
```

### Testing

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# E2E tests (requires building example site first)
npm run example:build
npm run test:e2e
```

### Code formatting

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

## Local development with a Docusaurus site

From your Docusaurus site:

```bash
# Using a local path during development
npm install ../path/to/docusaurus-plugin-statuspage

# Or via a temporary tarball
npm pack ../path/to/docusaurus-plugin-statuspage
npm install ./docusaurus-plugin-statuspage-*.tgz
```

## Access global data

Access global data set by the plugin from any theme component:

```js
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function StatusInfo() {
  const { globalData } = useDocusaurusContext()
  const data = globalData['docusaurus-plugin-statuspage']?.default
  return <div>{data?.statuspageUrl}</div>
}
```

## API

- Default export: the plugin function `(context, options) => Plugin`
- Types: `StatuspagePluginOptions`
- Client module: `client/index` with `onClientEntry` implementation

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
