import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../../utils/logger';
import { Config } from '../../utils/env';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
}

export abstract class BaseApiClient {
  protected authToken?: string;
  protected baseUrl: string;

  constructor(protected request: APIRequestContext, baseUrl?: string) {
    this.baseUrl = baseUrl || Config.apiBaseUrl;
  }

  /**
   * Set Bearer authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get currently active Bearer authentication token
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }

  /**
   * Merge default auth headers with custom request headers
   */
  protected getMergedHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    if (this.authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  protected async get(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const headers = this.getMergedHeaders(options?.headers);
    logger.info(`[API GET] Requesting: ${url}`);
    const response = await this.request.get(url, { headers, params: options?.params });
    logger.info(`[API GET] Status: ${response.status()}`);
    return response;
  }

  protected async post(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const headers = this.getMergedHeaders(options?.headers);
    logger.info(`[API POST] Requesting: ${url}`);
    const response = await this.request.post(url, { data: body, headers, params: options?.params });
    logger.info(`[API POST] Status: ${response.status()}`);
    return response;
  }

  protected async put(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const headers = this.getMergedHeaders(options?.headers);
    logger.info(`[API PUT] Requesting: ${url}`);
    const response = await this.request.put(url, { data: body, headers, params: options?.params });
    logger.info(`[API PUT] Status: ${response.status()}`);
    return response;
  }

  protected async delete(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    const headers = this.getMergedHeaders(options?.headers);
    logger.info(`[API DELETE] Requesting: ${url}`);
    const response = await this.request.delete(url, { headers, params: options?.params });
    logger.info(`[API DELETE] Status: ${response.status()}`);
    return response;
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanBase = this.baseUrl ? this.baseUrl.replace(/\/$/, '') : '';
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return cleanBase ? `${cleanBase}/${cleanEndpoint}` : `/${cleanEndpoint}`;
  }
}
