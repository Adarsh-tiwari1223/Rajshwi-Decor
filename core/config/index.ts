import { Config } from '../../utils/env';

export const FrameworkConfig = {
  ...Config,
  timeouts: {
    pageLoad: 30000,
    element: 10000,
    apiResponse: 15000
  },
  endpoints: {
    users: '/api/users',
    login: '/api/login',
    register: '/api/register'
  }
};
