# Commands

## Checks

- Tests: `npm test` — includes a temporary package build and packed import checks #quick #safe #ci
- Typecheck: `npm run typecheck` #quick #safe #ci
- Lint: `npm run lint` #quick #safe #ci
- Check formatting: `npm run format:check` #quick #safe #ci
- Build package: `npm run build` #quick #safe #ci
- Test coverage: `npm run test:coverage` — writes the coverage report #safe #ci
- Build example: `npm run example:build` #slow #safe #ci
- Browser tests: `npm run test:e2e` — requires a built example and Chromium; starts a local server #slow #safe #ci
- Prepublish checks: `npm run prepublishOnly` — builds and tests the package #safe #ci

## Development

- dev: `npm run dev` — rebuilds the package on changes #safe #long-running
- Watch tests: `npm run test:watch` #safe #long-running
- Browser test UI: `npm run test:e2e:ui` — requires a built example and Chromium #safe #long-running #interactive
- Example dev server: `npm run example:start` #safe #long-running
- Serve example: `npm run example:serve` — requires a built example #safe #long-running
- Serve browser-test example: `npm run example:serve:e2e` — requires a built example; listens on port 4000 #safe #long-running

## Maintenance

- Format sources: `npm run format` #writes
- Fix lint: `npm run lint:fix` #writes
- Clean build output: `npm run clean` — removes generated dist output #safe
- Install Git hooks: `npm run prepare` #writes
