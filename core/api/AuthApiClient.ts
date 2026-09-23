import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  permissions: any[];
  roles: any[];
  token: string;
  loginHistoryId: number;
}

export class AuthApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /**
   * Login user via POST /api/user/login
   */
  async login(payload: LoginPayload): Promise<APIResponse> {
    return this.post('/api/user/login', payload);
  }

  /**
   * Authenticate and return bearer token
   */
  async getAuthTokenFor(email: string, password: string): Promise<string> {
    const res = await this.login({ email, password });
    if (!res.ok()) {
      throw new Error(`Failed to authenticate user ${email}: Status ${res.status()}`);
    }
    const data: LoginResponse = await res.json();
    return data.token;
  }
}
