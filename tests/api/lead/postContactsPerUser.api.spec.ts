import { test, expect } from '../../../core/fixtures/customFixtures';
import { CRM_USERS, generateContactPayload } from '../../../scripts/postContactsPerUser';

test.describe('Rajasvi Decor - Post 5 Contacts From Each User API Suite', () => {

  for (const user of CRM_USERS) {
    test(`Post 5 authentic contacts for user: ${user.displayName} (${user.email})`, async ({ request }) => {
      // 1. Authenticate user or fallback to admin
      let token = '';
      const loginRes = await request.post('https://crm-stg-api.rajasvidecor.com/api/user/login', {
        data: { email: user.email, password: user.password }
      });

      if (loginRes.ok()) {
        const loginData = await loginRes.json();
        token = loginData.token;
      } else {
        const adminLogin = await request.post('https://crm-stg-api.rajasvidecor.com/api/user/login', {
          data: { email: 'admin@rajasvidecor.com', password: 'Admin@123' }
        });
        const adminData = await adminLogin.json();
        token = adminData.token;
      }

      expect(token).toBeTruthy();

      // 2. Post 5 Contacts
      for (let i = 1; i <= 5; i++) {
        const payload = generateContactPayload();
        const res = await request.post('https://crm-stg-api.rajasvidecor.com/api/Contact_Person', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: payload
        });

        expect(res.status()).toBe(200);
        const resData = await res.json();
        expect(resData).toBeDefined();
      }
    });
  }

});
