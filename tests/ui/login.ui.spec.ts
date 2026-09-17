import { test, expect } from '../../core/fixtures/customFixtures';
import { Config } from '../../utils/env';

test.describe('CRM Login Test Suite (Page Object Model)', () => {

  test.beforeEach(async ({ loginPage }) => {
    // Navigate to /login before each test scenario
    await loginPage.goto();
  });

  test('TC-LOG-001: Verify all Login Page UI elements load properly', async ({ loginPage, page }) => {
    // 1. Verify Page Title
    await expect(page).toHaveTitle(/Rajasvi|CRM|Login/i);

    // 2. Verify Locators & Element Visibilities
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordToggleBtn).toBeVisible();
    await expect(loginPage.loginSubmitBtn).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.forgotPasswordBtn).toBeVisible();

    // 3. Verify Placeholders & Button Text
    await expect(loginPage.emailInput).toHaveAttribute('placeholder', 'you@example.com');
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    await expect(loginPage.loginSubmitBtn).toHaveText('Sign In');
  });

  test('TC-LOG-002: Verify Password Visibility Toggle functionality', async ({ loginPage }) => {
    // 1. Enter password from environment configuration
    const testPassword = Config.adminPassword || 'TestPassword123!';
    await loginPage.passwordInput.fill(testPassword);

    // 2. Initially, password input type should be 'password'
    expect(await loginPage.getPasswordInputType()).toBe('password');

    // 3. Click toggle button to reveal password
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe('text');

    // 4. Click toggle button again to hide password
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.getPasswordInputType()).toBe('password');
  });

  test('TC-LOG-003: Successful Login with Valid Admin Credentials', async ({ loginPage, page }) => {
    // Perform login with credentials loaded securely from environment (.env)
    const email = Config.adminEmail;
    const password = Config.adminPassword;
    await loginPage.login(email, password, true);

    // Wait for navigation after successful sign-in
    await page.waitForTimeout(3000);
    
    // Verify dashboard navigation (URL changes away from /login)
    expect(page.url()).not.toContain('/login');
  });

  test('TC-LOG-004: Failed Login Attempt with Invalid Credentials', async ({ loginPage }) => {
    // Perform login with invalid credentials
    await loginPage.login('invalid-user@example.com', 'InvalidPassword!123');

    // Expect login page to remain on /login or display toast error
    await loginPage.page.waitForTimeout(2000);
    expect(loginPage.page.url()).toContain('/login');
  });

  test('TC-LOG-005: Form Submission with Empty Credentials', async ({ loginPage }) => {
    // Click Sign In with empty fields
    await loginPage.loginSubmitBtn.click();

    // Page URL should remain on /login
    expect(loginPage.page.url()).toContain('/login');
  });

});
