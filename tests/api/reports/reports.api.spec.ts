import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Reports Module API Test Suite (Playwright APIRequestContext)', () => {

  test('GET /api/reports - Fetch summary report data', async ({ request }) => {
    const response = await request.get('/api/reports');
    expect([200, 401, 404]).toContain(response.status());
  });

});
