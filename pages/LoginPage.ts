import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Exact DOM Locators for Login Page
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggleBtn: Locator;
  readonly loginSubmitBtn: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordBtn: Locator;
  readonly formHeading: Locator;
  readonly formSubheading: Locator;
  readonly toastErrorMsg: Locator;

  constructor(page: Page) {
    super(page);
    // 1. Email address input (#email / placeholder: "you@example.com")
    this.emailInput = page.locator('#email');
    
    // 2. Password input (#password / placeholder: "Enter your password")
    this.passwordInput = page.locator('#password');
    
    // 3. Password visibility toggle icon button (.login-password-toggle)
    this.passwordToggleBtn = page.locator('button.login-password-toggle');
    
    // 4. Sign In submit button (.login-submit / text: "Sign In")
    this.loginSubmitBtn = page.locator('button.login-submit');
    
    // 5. Remember Me checkbox wrapper (.remember-wrapper)
    this.rememberMeCheckbox = page.locator('.remember-wrapper');
    
    // 6. Forgot Password link button (.forgot-password)
    this.forgotPasswordBtn = page.locator('button.forgot-password');
    
    // 7. Form Headings
    this.formHeading = page.locator('h2:has-text("Sign in to your account")');
    this.formSubheading = page.locator('.login-card p, .login-subtitle');
    
    // 8. Toast Notification / Error message
    this.toastErrorMsg = page.locator('.p-toast-message-error, .p-toast-detail, .p-toast');
  }

  /**
   * Navigate directly to the login page (/login)
   */
  async goto(): Promise<void> {
    await this.navigateTo('/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Fill credentials and submit login form
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.type(this.emailInput, email, 'Email Address Field');
    await this.type(this.passwordInput, password, 'Password Field');
    
    if (rememberMe) {
      await this.click(this.rememberMeCheckbox, 'Remember Me Checkbox');
    }

    // 1. Monitor login API and wait for status 200 OK
    const loginResponsePromise = this.page.waitForResponse(
      res => res.url().toLowerCase().includes('/api/user/login') && res.status() === 200,
      { timeout: 45000 }
    );

    // 2. Setup listener to catch and handle Kommuno / third-party popup tabs automatically
    const context = this.page.context();
    const popupListener = async (popup: Page) => {
      try {
        await popup.waitForLoadState('domcontentloaded').catch(() => {});
        const pUrl = popup.url().toLowerCase();
        if (pUrl.includes('kommuno') || pUrl.includes('dialer') || pUrl.includes('softphone')) {
          console.log(`[LoginPage] Detected extra Kommuno tab (${pUrl}). Closing and switching back to Rajasvi Decor...`);
          await popup.close().catch(() => {});
          await this.page.bringToFront().catch(() => {});
        }
      } catch (_) {}
    };
    context.on('page', popupListener);

    // 3. Click Sign In Button
    await this.click(this.loginSubmitBtn, 'Sign In Button');

    // 4. Ensure login API returns 200 before proceeding
    await loginResponsePromise;

    // 5. Clean up any existing Kommuno tab and switch focus back to Rajasvi Decor tab
    await this.switchBackToRajasviTab();

    // 6. Wait for dashboard transition (URL /dashboard or visible dashboard indicator)
    await this.page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => {});
    const dashboardIndicator = this.page.locator('span:has-text("Dashboard"), .rd-dashboard, text=WELCOME BACK, text=Welcome back').first();
    await dashboardIndicator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(500);
    await this.switchBackToRajasviTab();
  }

  /**
   * Switch back to the primary Rajasvi Decor application tab if a secondary tab (e.g. Kommuno dialer) is opened
   */
  async switchBackToRajasviTab(): Promise<void> {
    const context = this.page.context();
    const pages = context.pages();
    for (const p of pages) {
      if (p !== this.page) {
        const pUrl = p.url().toLowerCase();
        if (pUrl.includes('kommuno') || pUrl.includes('dialer') || pUrl.includes('softphone') || pUrl === 'about:blank') {
          console.log(`[LoginPage] Extra tab found (${pUrl}). Closing tab and refocusing Rajasvi Decor...`);
          await p.close().catch(() => {});
        }
      }
    }
    await this.page.bringToFront().catch(() => {});
  }

  /**
   * Login as a specific user resolved by keyword, alias, or AppUser object.
   * If no argument is passed, resolves user from CLI args or TARGET_USER or defaults to Admin.
   */
  async loginAs(userOrKeyword?: string | import('../utils/userResolver').AppUser, rememberMe = false): Promise<import('../utils/userResolver').AppUser> {
    const { resolveUser } = await import('../utils/userResolver');
    const user = typeof userOrKeyword === 'string'
      ? resolveUser(userOrKeyword)
      : (userOrKeyword || resolveUser());

    await this.login(user.email, user.password, rememberMe);
    return user;
  }

  /**
   * Toggle password field visibility
   */

  async togglePasswordVisibility(): Promise<void> {
    await this.click(this.passwordToggleBtn, 'Password Visibility Toggle');
  }

  /**
   * Check if password input type is currently 'password' or 'text'
   */
  async getPasswordInputType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type');
  }

  /**
   * Click Forgot Password button
   */
  async clickForgotPassword(): Promise<void> {
    await this.click(this.forgotPasswordBtn, 'Forgot Password Link');
  }

  /**
   * Get displayed error message from toast notification
   */
  async getToastErrorMessage(): Promise<string> {
    await this.toastErrorMsg.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.toastErrorMsg.textContent()) || '';
  }
}
