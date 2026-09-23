import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export interface DepartmentDropdownItem {
  id: number;
  department_Name: string;
}

export class DepartmentApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  /**
   * Fetch department options for dropdowns via GET /api/department/dropdown
   */
  async getDepartmentDropdown(): Promise<APIResponse> {
    return this.get('/api/department/dropdown');
  }
}
