#!/usr/bin/env bash
echo "Starting Playwright Test Suite..."
npm run typecheck
npx playwright test "$@"
