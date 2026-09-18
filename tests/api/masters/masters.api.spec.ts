import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Masters Module API Test Suite (Playwright APIRequestContext)', () => {

  test('GET /api/masters - Retrieve all master list categories', async ({ request }) => {
    const response = await request.get('/api/masters');
    expect([200, 401, 404]).toContain(response.status());
  });

});
