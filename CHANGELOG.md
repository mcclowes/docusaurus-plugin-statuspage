# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- The banner never rendered: the client module exported `onClientEntry` (a Gatsby
  lifecycle) instead of a Docusaurus one. It now exports `onRouteDidUpdate`, which
  Docusaurus dispatches after the initial render and every navigation.
- The release workflow passed `--ci` to vitest, which rejects it, so nothing has been
  published since 0.1.0.

### Added

- Unit tests for the client module (jsdom) and E2E tests that assert the banner
  renders, stays hidden when operational, and persists dismissals.

- Unit tests with Jest (17 tests covering plugin lifecycle)
- E2E tests with Playwright (page load, banner behavior, accessibility)
- Example Docusaurus v3 site in `examples/docusaurus-v3/`
- GitHub Actions workflows for CI, E2E tests, and npm publishing
- Prettier configuration for code formatting
- CONTRIBUTING.md with development guidelines
- This CHANGELOG.md

### Changed

- Updated README with badges, testing section, and cleaner documentation
- Improved package.json with repository metadata and new scripts
- Updated peer dependencies to support both Docusaurus v2.4+ and v3.x

## [0.1.0] - 2024-12-11

### Added

- Initial release
- Display status banner when Statuspage.io reports degraded service or incidents
- Configurable position (bottom-left, bottom-right, top-left, top-right)
- Customizable link label
- Dismissible banners with localStorage persistence
- Unique banner IDs per incident for accurate dismissal tracking
- Accessible with ARIA labels and semantic HTML
- Respects Docusaurus theme variables for consistent styling
- Support for Docusaurus v2.4+ and v3.x
