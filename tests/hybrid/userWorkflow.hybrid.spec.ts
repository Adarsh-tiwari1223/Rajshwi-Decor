import { test, expect } from '../../core/fixtures/customFixtures';

test.describe('Hybrid Workflow: Google Sheets + Playwright Built-in API + UI Verification', () => {

  test('Data-driven user creation from Google Sheets and status logging', async ({
    userApiClient,
    googleSheetsService
  }) => {
    const startTime = Date.now();
    const testName = 'Data-driven user creation from Google Sheets';

    try {
      // 1. Read Test Data from Google Sheets (or fallback mock)
      const testRows = await googleSheetsService.readTestData('TestData');
      expect(testRows.length).toBeGreaterThan(0);

      const targetData = testRows[0];
      
      // 2. Perform API operation using Playwright built-in APIRequestContext
      const response = await userApiClient.createUser({
        name: targetData.username || 'Test User',
        job: 'Automation Engineer'
      });

      expect(response.status()).toBe(201);
      const createdUser = await response.json();
      expect(createdUser.name).toBe(targetData.username || 'Test User');

      // 3. Log test execution success back to Google Sheets
      await googleSheetsService.appendTestResult({
        testName,
        suite: 'Hybrid Suite',
        status: 'PASSED',
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Log failure to Google Sheets
      await googleSheetsService.appendTestResult({
        testName,
        suite: 'Hybrid Suite',
        status: 'FAILED',
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        errorMessage: (error as Error).message
      });
      throw error;
    }
  });
});
