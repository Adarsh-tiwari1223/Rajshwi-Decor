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

    await this.click(this.loginSubmitBtn, 'Sign In Button');
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
