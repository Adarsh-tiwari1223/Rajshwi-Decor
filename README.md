# HRLens Playwright TypeScript Framework

A high-performance, enterprise-ready **3-Tier Test Automation Framework** built with **Playwright**, **TypeScript**, **Playwright Built-in APIRequestContext**, **Google Sheets Integration**, **Docker**, and **GitHub Actions CI/CD**.

---

## Folder Structure

```
.
├── .agents/             # Custom agents / skills directory
├── .auth/               # Authentication storage states (JSON)
├── .github/
│   └── workflows/
│       └── playwright.yml # GitHub Actions workflow pipeline
├── .vscode/
│   └── settings.json    # VS Code workspace settings
├── core/
│   ├── api/             # Base API Client & Services (Playwright APIRequestContext)
│   ├── config/          # Environment configuration loader (.env parser)
│   └── fixtures/        # Custom Playwright Test Fixtures
├── docker/
│   ├── Dockerfile       # Official Playwright Docker build image
│   └── docker-compose.yml # Container execution composition
├── docs/
│   └── ARCHITECTURE.md  # 3-Tier Architecture design specification
├── logs/                # Framework execution logs
├── pages/               # Page Object Model classes (UI Tier)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── reports/             # HTML & JUnit test execution reports
├── scratch/             # Temporary scratch workspace
├── scripts/             # Shell/NPM execution helper scripts
├── specs/               # Test strategy & specifications
├── testdata/            # Static JSON test data
├── tests/               # Playwright test specifications (.spec.ts)
│   ├── api/             # API test suite (Playwright request API)
│   ├── ui/              # UI E2E test suite
│   └── hybrid/          # Combined API + UI + Google Sheets specs
├── utils/               # Framework utilities
│   ├── googleSheets.ts  # Google Sheets read/write integration service
│   ├── logger.ts        # Winston structured logger
│   └── env.ts           # Typed environment variable manager
├── workflows/           # Orchestration workflows
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── commands.md          # CLI commands cheat-sheet
├── credentials.json     # Google Service Account credentials placeholder
├── package.json         # Node.js dependencies & NPM scripts
├── playwright.config.ts # Playwright Test Runner configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project README documentation
```

---

## Key Features

1. **Playwright Built-in APIRequestContext**: Replaced external API libraries with Playwright's native `APIRequestContext` for blazingly fast, type-safe REST API testing.
2. **3-Tier Architecture**:
   - **Tier 1 (Presentation)**: Clean `.spec.ts` test files containing business expectations.
   - **Tier 2 (Logic & Service)**: Page Objects (`pages/`) and API Clients (`core/api/`).
   - **Tier 3 (Data & Infrastructure)**: Google Sheets integration (`utils/googleSheets.ts`), Winston loggers, static JSON datasets.
3. **Google Sheets Integration**: Read test datasets directly from Google Sheets tabs and automatically log execution results back.
4. **Docker Containerization**: Pre-built Docker container environment for zero-dependency execution.
5. **GitHub Actions Pipeline**: Automated CI matrix workflow triggering on PR and Push.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
npx playwright install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your base URLs and Google Sheet credentials.

### 3. Run Tests
```bash
# Run all tests
npm test

# Run API tests (Playwright request API)
npm run test:api

# Run UI tests
npm run test:ui

# Typecheck TypeScript
npm run typecheck
```

### 4. Run via Docker
```bash
npm run docker:build
npm run docker:run
```
