import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../../utils/logger';

export abstract class BaseApiClient {
  constructor(protected request: APIRequestContext, protected baseUrl?: string) {}

  protected async get(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    logger.info(`[API GET] Requesting: ${url}`);
    const response = await this.request.get(url, { headers });
    logger.info(`[API GET] Status: ${response.status()}`);
    return response;
  }

  protected async post(endpoint: string, body: any, headers?: Record<string, string>): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    logger.info(`[API POST] Requesting: ${url}`);
    const response = await this.request.post(url, { data: body, headers });
    logger.info(`[API POST] Status: ${response.status()}`);
    return response;
  }

  protected async put(endpoint: string, body: any, headers?: Record<string, string>): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    logger.info(`[API PUT] Requesting: ${url}`);
    const response = await this.request.put(url, { data: body, headers });
    logger.info(`[API PUT] Status: ${response.status()}`);
    return response;
  }

  protected async delete(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    const url = this.buildUrl(endpoint);
    logger.info(`[API DELETE] Requesting: ${url}`);
    const response = await this.request.delete(url, { headers });
    logger.info(`[API DELETE] Status: ${response.status()}`);
    return response;
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return endpoint;
  }
}
