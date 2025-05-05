import type { Page } from '@playwright/test';
import { loginAsTestUser } from '../utils/test-helpers';

export class BasePage {
  readonly page: Page;
  private isAuthenticated: boolean = false;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Ensure the user is authenticated before proceeding
   * If the user is not logged in, it will perform the login.
   */
  async ensureAuthenticated() {
    if (this.isAuthenticated) {
      return;
    }

    try {
      // Check if already logged in by looking for user menu or logout button
      const isAuthenticated = await Promise.race([
        this.page.getByTestId('user-menu-button').isVisible()
          .then(visible => visible)
          .catch(() => false),
        this.page.getByText('Wyloguj się').isVisible()
          .then(visible => visible)
          .catch(() => false)
      ]);
      
      if (!isAuthenticated) {
        await loginAsTestUser(this.page);
      }
      
      this.isAuthenticated = true;
    } catch (error) {
      console.error('Failed to authenticate:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logout() {
    if (!this.isAuthenticated) {
      return;
    }

    try {
      // Try to find and click the logout button either by test ID or by text
      const logoutByTestId = this.page.getByTestId('logout-button');
      const logoutByText = this.page.getByText('Wyloguj się');
      
      if (await logoutByTestId.isVisible()) {
        await logoutByTestId.click();
      } else if (await logoutByText.isVisible()) {
        await logoutByText.click();
      } else {
        // Try user menu button first if available
        const userMenuButton = this.page.getByTestId('user-menu-button');
        if (await userMenuButton.isVisible()) {
          await userMenuButton.click();
          await this.page.getByTestId('logout-button').click();
        } else {
          throw new Error('No logout mechanism found');
        }
      }
      
      // Wait for logout to complete
      await this.page.waitForURL('/**/login');
      
      this.isAuthenticated = false;
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }
} 