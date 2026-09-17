# Framework Test Strategy & Coverage

## Scope of Testing
- **API Testing**: Automated REST API endpoint validation using Playwright's built-in `APIRequestContext`. Covers GET, POST, PUT, DELETE operations with HTTP status and JSON schema verification.
- **UI E2E Testing**: End-to-end user interface automation leveraging Page Object Model design pattern.
- **Hybrid Testing**: Multi-layer scenarios using API to create prerequisite state, performing UI verification, and logging execution metrics to Google Sheets.

## Execution Matrix
- **Local Runs**: Headed / Headless execution via `@playwright/test` CLI.
- **Containerized Runs**: Isolated dockerized execution via `docker-compose`.
- **CI/CD Pipeline**: GitHub Actions matrix workflow triggered on Pull Request and Push.
