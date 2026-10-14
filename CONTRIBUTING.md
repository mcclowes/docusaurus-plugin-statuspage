# Contributing to docusaurus-plugin-statuspage

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mcclowes/docusaurus-plugin-statuspage.git
   cd docusaurus-plugin-statuspage
   ```

2. **Install dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Build the plugin:**

   ```bash
   npm run build
   ```

   For development with auto-rebuild:

   ```bash
   npm run dev
   ```

4. **Run tests:**

   ```bash
   npm test
   ```

   Or in watch mode:

   ```bash
   npm run test:watch
   ```

5. **Run the example site:**

   ```bash
   npm --prefix examples/docusaurus-v3 install
   npm run example:start
   ```

## Project structure

```
docusaurus-plugin-statuspage/
├── src/
│   ├── index.ts           # Main plugin entry point
│   ├── plugin.ts          # Plugin implementation
│   ├── types.ts           # TypeScript type definitions
│   └── client/
│       └── index.ts       # Client-side banner logic
├── tests/
│   ├── plugin.test.ts     # Server-side plugin tests
│   ├── client.test.ts     # Banner and dismissal tests in jsdom
│   └── package.test.ts    # Built tarball exports and cold Node imports
├── e2e/
│   └── statuspage.spec.js # E2E tests
├── examples/
│   └── docusaurus-v3/     # Example Docusaurus site
├── dist/                  # Built output (generated)
└── package.json
```

## Testing

### Unit tests

Vitest checks the server-side plugin, client banner behavior in jsdom, and the packed package.

The package test builds into a temporary directory, packs without lifecycle scripts, and checks the archive's advertised files, ESM/CommonJS imports, and client-module resolution. It runs as part of `npm test` and removes its temporary files afterward.

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### E2E tests

E2E tests use Playwright and test the full plugin behavior in a browser:

```bash
# Install the example dependencies and build the site
npm --prefix examples/docusaurus-v3 install
npm run example:build

# Install the Chromium browser used by the tests
npx playwright install chromium

# Run E2E tests
npm run test:e2e

# Or with UI
npm run test:e2e:ui
```

On Linux, use `npx playwright install --with-deps chromium` to install the browser's system dependencies, as the E2E workflow does. The tests start their own local example server on port 4000.

## Code style

We use Prettier for code formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

## Pull request process

1. Fork the repository and create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Create a PR with a clear description

## Commit messages

We prefer conventional commit messages:

- `feat: add new feature`
- `fix: resolve bug in X`
- `docs: update documentation`
- `test: add tests for X`
- `chore: update dependencies`

## Release process

Releases are automated via GitHub Actions when a new release is published.

1. Update version in `package.json`
2. Create and push a tag: `git tag v0.1.0 && git push --tags`
3. Create a GitHub release for the tag
4. The publish workflow will automatically publish to npm

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
