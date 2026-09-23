import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';
import { LazyParams } from './RoleApiClient';

export class MasterApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  private buildLazyQuery(lazyParams?: LazyParams | number): string {
    let params: LazyParams;
    if (typeof lazyParams === 'number') {
      params = {
        first: (lazyParams - 1) * 25,
        rows: 25,
        page: lazyParams,
        sortField: 'id',
        sortOrder: -1
      };
    } else {
      params = lazyParams || {
        first: 0,
        rows: 25,
        page: 1,
        sortField: 'id',
        sortOrder: -1
      };
    }
    return encodeURIComponent(JSON.stringify(params));
  }

  // --- Geographic Masters ---
  async getCountries(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/country?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getStates(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/state?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getCities(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/city?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  // --- Lead & Contact Masters ---
  async getSources(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/source?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getStatuses(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/status?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getDepartments(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/department?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  // --- Product & Decor Masters ---
  async getCategories(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/Category?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getFragrances(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/Fragrance?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getWaxTypes(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/Wax_type?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getProducts(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/Product?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  async getProductTypes(lazyParams?: LazyParams | number): Promise<APIResponse> {
    return this.get(`/api/Product_Type?lazyParams=${this.buildLazyQuery(lazyParams)}`);
  }

  // --- Communication Masters ---
  async getEmailTemplates(): Promise<APIResponse> {
    return this.get('/api/Email_Template');
  }
}
