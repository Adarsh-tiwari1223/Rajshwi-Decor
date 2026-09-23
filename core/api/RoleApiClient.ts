import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export interface LazyParams {
  first?: number;
  rows?: number;
  page?: number;
  sortField?: string;
  sortOrder?: number;
  filters?: Record<string, any>;
}

export interface RoleDropdownItem {
  id: number;
  name: string;
}

export interface RoleItem {
  id: number;
  name: string;
  desc: string | null;
  userRole: any;
  permission: any;
  created_By: any;
  updated_By: any;
  createdAt: string;
}

export interface RoleListResponse {
  roles: RoleItem[];
  count: number;
}

export class RoleApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /**
   * Fetch paginated roles list via GET /api/role?lazyParams=...
   */
  async getRoles(lazyParams?: LazyParams): Promise<APIResponse> {
    const params = lazyParams || {
      first: 0,
      rows: 25,
      page: 1,
      sortField: 'id',
      sortOrder: -1
    };

    const encodedParams = encodeURIComponent(JSON.stringify(params));
    return this.get(`/api/role?lazyParams=${encodedParams}`);
  }

  /**
   * Fetch role options for dropdowns via GET /api/role/dropdown
   */
  async getRoleDropdown(): Promise<APIResponse> {
    return this.get('/api/role/dropdown');
  }
}
