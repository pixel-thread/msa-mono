// Removed explicit @jest/globals import to use global types from @types/jest

import { buildUrlWithQuery } from '../url';

describe('buildUrlWithQuery', () => {
  it('should build a URL with query parameters for absolute URLs', () => {
    const url = 'https://example.com';
    const query = { foo: 'bar', baz: 123 };
    expect(buildUrlWithQuery(url, query)).toBe('https://example.com/?foo=bar&baz=123');
  });

  it('should build a URL with query parameters for relative URLs', () => {
    const url = '/api/data';
    const query = { foo: 'bar', baz: 123 };
    expect(buildUrlWithQuery(url, query)).toBe('/api/data?foo=bar&baz=123');
  });

  it('should overwrite existing query parameters', () => {
    const url = 'https://example.com?foo=old';
    const query = { foo: 'new', baz: 'qux' };
    expect(buildUrlWithQuery(url, query)).toBe('https://example.com/?foo=new&baz=qux');
  });

  it('should filter out null or undefined values', () => {
    const url = 'https://example.com';
    const query = { foo: 'bar', baz: null, qux: undefined };
    expect(buildUrlWithQuery(url, query)).toBe('https://example.com/?foo=bar');
  });

  it('should handle boolean and number values', () => {
    const url = 'https://example.com';
    const query = { active: true, count: 0 };
    expect(buildUrlWithQuery(url, query)).toBe('https://example.com/?active=true&count=0');
  });

  it('should preserve existing hash', () => {
    const url = '/path#section';
    const query = { foo: 'bar' };
    expect(buildUrlWithQuery(url, query)).toBe('/path?foo=bar#section');
  });

  it('should handle URLs that are just a path without leading slash', () => {
    const url = 'path/to/resource';
    const query = { foo: 'bar' };
    expect(buildUrlWithQuery(url, query)).toBe('path/to/resource?foo=bar');
  });
});
