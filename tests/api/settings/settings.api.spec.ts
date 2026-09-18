import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Settings Module API Test Suite (Playwright APIRequestContext)', () => {

  test('GET /api/settings - Fetch user & application settings', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect([200, 401, 404]).toContain(response.status());
  });

});
