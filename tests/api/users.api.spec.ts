import { test, expect } from '../../core/fixtures/customFixtures';

test.describe('Users API Test Suite (Playwright Built-in APIRequestContext)', () => {
  
  test('GET /api/users - Fetch paginated user list', async ({ userApiClient }) => {
    const response = await userApiClient.getUsers(1);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('page', 1);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/users/:id - Fetch single user details', async ({ userApiClient }) => {
    const userId = 2;
    const response = await userApiClient.getUserById(userId);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveProperty('id', userId);
    expect(body.data).toHaveProperty('email');
    expect(body.data.email).toContain('@reqres.in');
  });

  test('POST /api/users - Create new user record', async ({ userApiClient }) => {
    const payload = { name: 'morpheus', job: 'leader' };
    const response = await userApiClient.createUser(payload);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('name', payload.name);
    expect(body).toHaveProperty('job', payload.job);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });

  test('PUT /api/users/:id - Update user record', async ({ userApiClient }) => {
    const userId = 2;
    const payload = { name: 'morpheus', job: 'zion resident' };
    const response = await userApiClient.updateUser(userId, payload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('job', payload.job);
  });

  test('DELETE /api/users/:id - Delete user record', async ({ userApiClient }) => {
    const userId = 2;
    const response = await userApiClient.deleteUser(userId);
    expect(response.status()).toBe(204);
  });
});
