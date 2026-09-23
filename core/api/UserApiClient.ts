import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';
import { LazyParams } from './RoleApiClient';

export interface UserDropdownItem {
  id: number;
  name: string;
}

export interface UserDepartment {
  department_Name: string;
  description: string | null;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  password?: string;
  department_ID: number;
  department?: UserDepartment;
  roles?: any[];
  mobile?: string;
  isActive?: boolean;
}

export interface UserListResponse {
  users: UserItem[];
  count: number;
}

export interface CreateUserPayload {
  name: string;
  job?: string;
  email?: string;
  password?: string;
  department_ID?: number;
}

export class UserApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /**
   * Fetch paginated users list via GET /api/user?lazyParams=... or page number
   */
  async getUsers(lazyParamsOrPage?: LazyParams | number): Promise<APIResponse> {
    let params: LazyParams;
    if (typeof lazyParamsOrPage === 'number') {
      params = {
        first: (lazyParamsOrPage - 1) * 25,
        rows: 25,
        page: lazyParamsOrPage,
        sortField: 'id',
        sortOrder: -1
      };
    } else {
      params = lazyParamsOrPage || {
        first: 0,
        rows: 25,
        page: 1,
        sortField: 'id',
        sortOrder: -1
      };
    }

    const encodedParams = encodeURIComponent(JSON.stringify(params));
    return this.get(`/api/user?lazyParams=${encodedParams}`);
  }

  /**
   * Fetch user options for dropdowns via GET /api/dropdown/user
   */
  async getUserDropdown(): Promise<APIResponse> {
    return this.get('/api/dropdown/user');
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<APIResponse> {
    return this.get(`/api/user/${id}`);
  }

  /**
   * Create user record
   */
  async createUser(payload: CreateUserPayload): Promise<APIResponse> {
    return this.post('/api/user', payload);
  }

  /**
   * Update user record
   */
  async updateUser(id: number, payload: Partial<CreateUserPayload>): Promise<APIResponse> {
    return this.put(`/api/user/${id}`, payload);
  }

  /**
   * Delete user record
   */
  async deleteUser(id: number): Promise<APIResponse> {
    return this.delete(`/api/user/${id}`);
  }
}
