import { describe, expect, it } from 'vitest';

import { getApiErrorMessage } from './apiError';

const fakeT = (key) => `translated:${key}`;

describe('getApiErrorMessage', () => {
  it('maps a known backend message to its translation key', () => {
    const error = { response: { status: 401, data: { message: 'Invalid email or password' } } };
    expect(getApiErrorMessage(error, fakeT)).toBe('translated:errors.invalidCredentials');
  });

  it('maps the "Missing required fields:" prefix to requiredFields', () => {
    const error = { response: { status: 400, data: { message: 'Missing required fields: name, email' } } };
    expect(getApiErrorMessage(error, fakeT)).toBe('translated:errors.requiredFields');
  });

  it('maps the "must be a positive number" suffix to positiveNumber', () => {
    const error = { response: { status: 400, data: { message: 'Price must be a positive number' } } };
    expect(getApiErrorMessage(error, fakeT)).toBe('translated:errors.positiveNumber');
  });

  it('falls back to the provided fallback key for an unrecognized message', () => {
    const error = { response: { status: 400, data: { message: 'Some brand-new backend message' } } };
    expect(getApiErrorMessage(error, fakeT, 'errors.bookingFailed')).toBe('translated:errors.bookingFailed');
  });

  it('returns apiUnavailable on a network error', () => {
    const error = { code: 'ERR_NETWORK' };
    expect(getApiErrorMessage(error, fakeT)).toBe('translated:errors.apiUnavailable');
  });

  it('returns apiUnavailable when there is no response at all', () => {
    expect(getApiErrorMessage({}, fakeT)).toBe('translated:errors.apiUnavailable');
  });
});
