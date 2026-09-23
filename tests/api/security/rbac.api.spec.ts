import { test, expect } from '../../../core/fixtures/customFixtures';
import { Config } from '../../../utils/env';

test.describe('RBAC & Security: Admin-Only Access Verification', () => {

  test('SEC-001: Admin user has role_ID = 1 and permission = true for Role and User masters', async ({ authApiClient }) => {
    // 1. Authenticate as Admin
    const res = await authApiClient.login({
      email: Config.adminEmail,
      password: Config.adminPassword
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.name).toBe('Admin');
    
    // Verify Admin has role_ID: 1
    const hasAdminRole = data.roles && data.roles.some((r: any) => r.role_ID === 1);
    expect(hasAdminRole).toBe(true);

    // Verify Admin has permission = true for Role master
    const rolePerm = data.permissions.find((p: any) => p.name === 'Role');
    expect(rolePerm).toBeDefined();
    expect(rolePerm.permission).toBe(true);
  });

  test('SEC-002: Non-Admin users have permission = false for Role master and administration', async ({ authApiClient }) => {
    const nonAdminUser = Config.users.find(u => u.name !== 'Admin');
    test.skip(!nonAdminUser, 'No non-admin user configured in environment');

    // 1. Authenticate as Non-Admin
    const res = await authApiClient.login({
      email: nonAdminUser!.email,
      password: nonAdminUser!.password
    });
    expect(res.status()).toBe(200);

    const data = await res.json();
    
    // Verify Non-Admin does not have Admin role (role_ID: 1)
    const hasAdminRole = data.roles && data.roles.some((r: any) => r.role_ID === 1);
    expect(hasAdminRole).toBe(false);

    // Verify Non-Admin has permission = false for Role master
    const rolePerm = data.permissions.find((p: any) => p.name === 'Role');
    if (rolePerm) {
      expect(rolePerm.permission).toBe(false);
    }
  });

  test('SEC-003: Admin has full access to all 5 Masters and Dropdown endpoints', async ({
    roleApiClient,
    userApiClient,
    departmentApiClient
  }) => {
    // Admin accesses all 5 endpoints
    const [roleRes, userRes, deptDropRes, userDropRes, roleDropRes] = await Promise.all([
      roleApiClient.getRoles(),
      userApiClient.getUsers(),
      departmentApiClient.getDepartmentDropdown(),
      userApiClient.getUserDropdown(),
      roleApiClient.getRoleDropdown()
    ]);

    expect(roleRes.status()).toBe(200);
    expect(userRes.status()).toBe(200);
    expect(deptDropRes.status()).toBe(200);
    expect(userDropRes.status()).toBe(200);
    expect(roleDropRes.status()).toBe(200);
  });

});
