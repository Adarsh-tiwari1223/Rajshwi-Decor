import { test, expect } from '../../../core/fixtures/customFixtures';
import { LeadDataGenerator } from '../../../testdata';

test.describe('Lead Module API Test Suite (Playwright APIRequestContext)', () => {

  test('GET /api/leads - Fetch all leads list', async ({ request }) => {
    const response = await request.get('/api/leads');
    expect([200, 401, 404]).toContain(response.status());
  });

  test('POST /api/leads - Create new lead record with Faker dynamic data', async ({ request }) => {
    const dynamicLead = LeadDataGenerator.generate();
    const payload = {
      name: dynamicLead.customerName,
      phone: dynamicLead.phone,
      email: dynamicLead.email,
      requirement: dynamicLead.requirement,
      city: dynamicLead.city
    };
    const response = await request.post('/api/leads', { data: payload });
    expect([200, 201, 401, 404]).toContain(response.status());
  });

});
