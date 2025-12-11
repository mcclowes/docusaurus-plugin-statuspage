# Contributing to docusaurus-plugin-statuspage

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

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
   npm run example:start
   ```

## Project Structure

```
docusaurus-plugin-statuspage/
├── src/
│   ├── index.ts           # Main plugin entry point
│   ├── plugin.ts          # Plugin implementation
│   ├── types.ts           # TypeScript type definitions
│   └── client/
│       └── index.ts       # Client-side banner logic
├── __tests__/
│   └── plugin.test.ts     # Unit tests
├── e2e/
│   └── statuspage.spec.js # E2E tests
├── examples/
│   └── docusaurus-v3/     # Example Docusaurus site
├── dist/                  # Built output (generated)
└── package.json
```

## Testing

### Unit Tests

Unit tests use Jest and test the plugin's server-side logic:

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### E2E Tests

E2E tests use Playwright and test the full plugin behavior in a browser:

```bash
# First, build the example site
npm run example:build

# Run E2E tests
npm run test:e2e

# Or with UI
npm run test:e2e:ui
```

## Code Style

We use Prettier for code formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

## Pull Request Process

1. Fork the repository and create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Format code: `npm run format`
5. Create a PR with a clear description

## Commit Messages

We prefer conventional commit messages:

- `feat: add new feature`
- `fix: resolve bug in X`
- `docs: update documentation`
- `test: add tests for X`
- `chore: update dependencies`

## Release Process

Releases are automated via GitHub Actions when a new release is published.

1. Update version in `package.json`
2. Create and push a tag: `git tag v0.1.0 && git push --tags`
3. Create a GitHub release for the tag
4. The publish workflow will automatically publish to npm

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
