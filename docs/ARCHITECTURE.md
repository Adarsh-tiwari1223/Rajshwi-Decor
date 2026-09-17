# 3-Tier Test Automation Architecture

This framework implements a enterprise-grade **3-Tier Architecture** for maintainability, high reusability, and separation of concerns.

```
┌────────────────────────────────────────────────────────┐
│                   TIER 1: TEST / SPECS                 │
│   (tests/api/*.spec.ts, tests/ui/*.spec.ts, hybrid)    │
└───────────────────────────┬────────────────────────────┘
                            │ Calls Fixtures & Objects
                            ▼
┌────────────────────────────────────────────────────────┐
│                 TIER 2: LOGIC & SERVICE                │
│   • Page Object Model (pages/*.ts)                     │
│   • API Services (core/api/* using Playwright request) │
│   • Custom Fixtures (core/fixtures/*)                  │
└───────────────────────────┬────────────────────────────┘
                            │ Consumes Data & Helpers
                            ▼
┌────────────────────────────────────────────────────────┐
│              TIER 3: DATA & INFRASTRUCTURE             │
│   • Google Sheets Service (utils/googleSheets.ts)      │
│   • Logging (utils/logger.ts)                          │
│   • Static Test Data (testdata/*.json)                 │
│   • Environment Config (.env, utils/env.ts)            │
└────────────────────────────────────────────────────────┘
```

## Tier Breakdown

### Tier 1: Presentation & Test Specs (`tests/`)
- Contains test suites divided by type (`api`, `ui`, `hybrid`).
- Focuses strictly on test scenarios, step declarations, and assertions.
- Does not contain raw selectors or HTTP connection details.

### Tier 2: Business Logic & Service Layer (`pages/`, `core/api/`, `core/fixtures/`)
- **Page Objects (`pages/`)**: Encapsulate DOM element locators and user interactions.
- **API Services (`core/api/`)**: Built on Playwright's native `APIRequestContext` (`request`) for type-safe REST endpoint calls.
- **Custom Fixtures (`core/fixtures/`)**: Inject page objects, API clients, and Google Sheets services cleanly into tests.

### Tier 3: Data & Infrastructure (`utils/`, `testdata/`, `core/config/`)
- **Google Sheets Integration**: Read dynamic test input rows and write back pass/fail execution results.
- **Winston Logger**: Centralized structured logging to console and execution files.
- **Environment Management**: Typed config loader supporting `.env` configurations across Staging/Production environments.
