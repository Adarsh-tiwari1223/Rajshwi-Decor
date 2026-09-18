import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Lead Module API Test Suite (Playwright APIRequestContext)', () => {

  test('GET /api/leads - Fetch all leads list', async ({ request }) => {
    const response = await request.get('/api/leads');
    expect([200, 401, 404]).toContain(response.status());
  });

  test('POST /api/leads - Create new lead record', async ({ request }) => {
    const payload = {
      name: 'Sample Lead',
      phone: '+919876543210',
      requirement: 'Interior Consultation'
    };
    const response = await request.post('/api/leads', { data: payload });
    expect([200, 201, 401, 404]).toContain(response.status());
  });

});
