# URL Query Builder Helper Design

**Status:** DRAFT
**Created:** 2026-06-02
**Last Updated:** 2026-06-02

## Purpose
Provide a robust, type-safe utility for appending query parameters to URLs. This helper is designed to work across Web (Next.js) and Mobile (Expo/React Native) environments.

## Scope
- Input: A base URL string and an object representing query parameters.
- Output: A final URL string with all parameters properly encoded.

## Requirements
- **Overwrite:** If a query key exists in both the base URL and the provided record, the record value wins.
- **Filtering:** `null` or `undefined` values in the record are excluded from the output.
- **Encoding:** Proper URI encoding for all keys and values.
- **Portability:** Must run in both Browser and React Native environments using standard APIs.

## Architecture
- **Location:** `packages/shared/src/utils/url.ts`
- **Dependency:** Uses standard `URL` and `URLSearchParams` globals.

## Data Flow
1. Receive `url` string and `query` object.
2. Determine if `url` is absolute. If relative, use a dummy base (e.g., `http://localhost`) to utilize the `URL` API.
3. Construct a `URL` object.
4. Iterate through the `query` record.
5. For each key-value pair:
   - If value is `null` or `undefined`, skip.
   - Otherwise, call `url.searchParams.set(key, String(value))`.
6. If a dummy base was used, return `url.pathname + url.search + url.hash`. Otherwise, return `url.toString()`.

## Testing Strategy
- Unit tests using Vitest (or the standard test runner for `packages/shared`).
- Test cases:
  - Simple URL without params.
  - URL with existing params (should be overwritten).
  - Relative URLs (e.g., `/api/data`).
  - Record with `null` or `undefined` values (should be ignored).
  - Special characters (should be encoded).
  - Empty record.
