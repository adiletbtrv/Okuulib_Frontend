// __tests__/api.test.ts
jest.mock('../store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({ accessToken: null, user: null }),
  },
}));

jest.mock('../lib/config', () => ({
  config: {
    API_URL: 'http://localhost:8082',
    WS_URL: 'ws://localhost:8082',
    IS_DEV: true,
    IS_PRODUCTION: false,
    APP_VERSION: '1.0.0',
    BUILD_NUMBER: undefined,
  },
}));

jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }),
  default: { create: jest.fn() },
}));

import { getApiErrorMessage, safeApi } from '../lib/api';

describe('getApiErrorMessage', () => {
  it('returns Kyrgyz string for 401', () => {
    expect(getApiErrorMessage({ response: { status: 401 } }))
      .toBe('Логин же сырсөз туура эмес.');
  });

  it('returns Kyrgyz string for 403', () => {
    expect(getApiErrorMessage({ response: { status: 403 } }))
      .toBe('Кирүүгө уруксат жок.');
  });

  it('returns Kyrgyz string for 404', () => {
    expect(getApiErrorMessage({ response: { status: 404 } }))
      .toBe('Суралган ресурс табылган жок.');
  });

  it('returns Kyrgyz string for 409', () => {
    expect(getApiErrorMessage({ response: { status: 409 } }))
      .toContain('катталган');
  });

  it('uses server message when status is 422', () => {
    expect(getApiErrorMessage({ response: { status: 422, data: { message: 'Email invalid' } } }))
      .toBe('Email invalid');
  });

  it('uses server message when available over fallback', () => {
    expect(getApiErrorMessage({ response: { data: { message: 'Custom server error' } } }))
      .toBe('Custom server error');
  });

  it('returns fallback for null', () => {
    expect(getApiErrorMessage(null))
      .toBe('Ката кетти. Кийинчерээк аракет кылыңыз.');
  });

  it('returns fallback for empty object', () => {
    expect(getApiErrorMessage({}))
      .toBe('Ката кетти. Кийинчерээк аракет кылыңыз.');
  });
});

describe('safeApi', () => {
  it('returns data on resolve', async () => {
    const result = await safeApi(Promise.resolve({ id: 1, title: 'Манас' }));
    expect(result.data).toEqual({ id: 1, title: 'Манас' });
    expect(result.error).toBeNull();
  });

  it('returns error string on reject with known status', async () => {
    const result = await safeApi(
      Promise.reject({ response: { status: 403 } })
    );
    expect(result.data).toBeNull();
    expect(result.error).toBe('Кирүүгө уруксат жок.');
  });

  it('returns error string on reject with unknown error', async () => {
    const result = await safeApi(Promise.reject(new Error('Network failure')));
    expect(result.data).toBeNull();
    expect(result.error).toBe('Network failure');
  });
});
