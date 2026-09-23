import { test, expect } from '../../../core/fixtures/customFixtures';

test.describe('Rajasvi Decor - Complete CRM Master APIs Test Suite', () => {

  // --- 1. Geographic Masters ---
  test('API-MST-001: GET /api/country retrieves paginated countries list', async ({ masterApiClient }) => {
    const response = await masterApiClient.getCountries(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-002: GET /api/state retrieves paginated states list', async ({ masterApiClient }) => {
    const response = await masterApiClient.getStates(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-003: GET /api/city retrieves paginated cities list', async ({ masterApiClient }) => {
    const response = await masterApiClient.getCities(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  // --- 2. Lead & Contact Masters ---
  test('API-MST-004: GET /api/source retrieves lead sources', async ({ masterApiClient }) => {
    const response = await masterApiClient.getSources(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-005: GET /api/status retrieves lead lifecycle statuses', async ({ masterApiClient }) => {
    const response = await masterApiClient.getStatuses(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-006: GET /api/department retrieves organizational departments', async ({ masterApiClient }) => {
    const response = await masterApiClient.getDepartments(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  // --- 3. Product & Manufacturing Masters ---
  test('API-MST-007: GET /api/Category retrieves product categories', async ({ masterApiClient }) => {
    const response = await masterApiClient.getCategories(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-008: GET /api/Fragrance retrieves candle fragrances', async ({ masterApiClient }) => {
    const response = await masterApiClient.getFragrances(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-009: GET /api/Wax_type retrieves wax formulation types', async ({ masterApiClient }) => {
    const response = await masterApiClient.getWaxTypes(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-010: GET /api/Product retrieves finished goods product catalog', async ({ masterApiClient }) => {
    const response = await masterApiClient.getProducts(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('API-MST-011: GET /api/Product_Type retrieves product classifications', async ({ masterApiClient }) => {
    const response = await masterApiClient.getProductTypes(1);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

  // --- 4. Communication Masters ---
  test('API-MST-012: GET /api/Email_Template retrieves email notification templates', async ({ masterApiClient }) => {
    const response = await masterApiClient.getEmailTemplates();
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
  });

});
