import { test, expect } from '../../../core/fixtures/customFixtures';
import { RoleListResponse } from '../../../core/api/RoleApiClient';
import { UserListResponse } from '../../../core/api/UserApiClient';
import { DepartmentDropdownItem } from '../../../core/api/DepartmentApiClient';

test.describe('Rajasvi Decor CRM - Masters & Dropdowns API Test Suite', () => {

  // 1. Role LazyParams API
  test('API-ROLE-001: GET /api/role with lazyParams retrieves paginated roles list', async ({ roleApiClient }) => {
    const lazyParams = {
      first: 0,
      rows: 25,
      page: 1,
      sortField: 'id',
      sortOrder: -1
    };

    const response = await roleApiClient.getRoles(lazyParams);
    expect(response.status()).toBe(200);

    const data: RoleListResponse = await response.json();
    expect(data).toHaveProperty('roles');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.roles)).toBe(true);
    expect(data.count).toBeGreaterThan(0);

    // Verify role object structure
    const firstRole = data.roles[0];
    expect(firstRole).toHaveProperty('id');
    expect(firstRole).toHaveProperty('name');
  });

  // 2. User LazyParams API
  test('API-USER-001: GET /api/user with lazyParams retrieves paginated users list', async ({ userApiClient }) => {
    const lazyParams = {
      first: 0,
      rows: 25,
      page: 1,
      sortField: 'id',
      sortOrder: -1
    };

    const response = await userApiClient.getUsers(lazyParams);
    expect(response.status()).toBe(200);

    const data: UserListResponse = await response.json();
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('count');
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.count).toBeGreaterThan(0);

    // Verify user object structure
    const firstUser = data.users[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('department_ID');
  });

  // 3. Department Dropdown API
  test('API-DROP-001: GET /api/department/dropdown retrieves department options', async ({ departmentApiClient }) => {
    const response = await departmentApiClient.getDepartmentDropdown();
    expect(response.status()).toBe(200);

    const departments: DepartmentDropdownItem[] = await response.json();
    expect(Array.isArray(departments)).toBe(true);
    expect(departments.length).toBeGreaterThan(0);

    // Verify structure
    const sampleDept = departments[0];
    expect(sampleDept).toHaveProperty('id');
    expect(sampleDept).toHaveProperty('department_Name');
    expect(typeof sampleDept.id).toBe('number');
    expect(typeof sampleDept.department_Name).toBe('string');
  });

  // 4. User Dropdown API
  test('API-DROP-002: GET /api/dropdown/user retrieves user options', async ({ userApiClient }) => {
    const response = await userApiClient.getUserDropdown();
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);

    // Verify structure
    const sampleUser = users[0];
    expect(sampleUser).toHaveProperty('id');
    expect(sampleUser).toHaveProperty('name');
    expect(typeof sampleUser.id).toBe('number');
    expect(typeof sampleUser.name).toBe('string');
  });

  // 5. Role Dropdown API
  test('API-DROP-003: GET /api/role/dropdown retrieves role options', async ({ roleApiClient }) => {
    const response = await roleApiClient.getRoleDropdown();
    expect(response.status()).toBe(200);

    const roles = await response.json();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.length).toBeGreaterThan(0);

    // Verify structure
    const sampleRole = roles[0];
    expect(sampleRole).toHaveProperty('id');
    expect(sampleRole).toHaveProperty('name');
    expect(typeof sampleRole.id).toBe('number');
    expect(typeof sampleRole.name).toBe('string');
  });

  // 6. Security: Unauthorized Access Validation
  test('API-SEC-001: Validates unauthenticated requests are rejected with 401 Unauthorized', async ({ request }) => {
    // Attempt to access protected endpoint without Authorization header
    const response = await request.get('https://crm-stg-api.rajasvidecor.com/api/role/dropdown');
    expect(response.status()).toBe(401);
  });

});
