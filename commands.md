# Useful Playwright & Framework Commands

## Local Test Execution
```bash
# Run all tests
npm test

# Run UI tests only
npm run test:ui

# Run API tests only (built-in Playwright request API)
npm run test:api

# Run tests in headed browser mode
npm run test:headed

# Debug mode with Playwright Inspector
npm run test:debug

# View HTML Test Report
npm run test:report

# TypeScript compile & type check
npm run typecheck
```

## Docker Commands
```bash
# Build Docker image
npm run docker:build

# Run tests inside Docker container
npm run docker:run
```

## Specific Test Run Examples
```bash
# Run a specific spec file
npx playwright test tests/api/users.api.spec.ts

# Run tests matching a grep tag
npx playwright test --grep "@smoke"
```
