import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export interface CreateUserPayload {
  name: string;
  job: string;
}

export interface CreateUserResponse {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

export interface UserDetailsResponse {
  data: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

export class UserApiClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async getUsers(page = 1): Promise<APIResponse> {
    return this.get(`/api/users?page=${page}`);
  }

  async getUserById(id: number): Promise<APIResponse> {
    return this.get(`/api/users/${id}`);
  }

  async createUser(payload: CreateUserPayload): Promise<APIResponse> {
    return this.post('/api/users', payload);
  }

  async updateUser(id: number, payload: Partial<CreateUserPayload>): Promise<APIResponse> {
    return this.put(`/api/users/${id}`, payload);
  }

  async deleteUser(id: number): Promise<APIResponse> {
    return this.delete(`/api/users/${id}`);
  }
}
