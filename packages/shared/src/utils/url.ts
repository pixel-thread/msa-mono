/**
 * URL Utilities
 */

/**
 * Builds a URL with query parameters.
 * Handles both absolute and relative URLs.
 * Overwrites existing query parameters if they exist in the query object.
 * Filters out null or undefined values.
 */
export function buildUrlWithQuery(
  url: string,
  query: Record<string, string | number | boolean | null | undefined>
): string {
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
  const dummyBase = 'http://localhost';
  const urlObj = new URL(url, isAbsolute ? undefined : dummyBase);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      urlObj.searchParams.set(key, String(value));
    }
  });

  if (isAbsolute) {
    return urlObj.toString();
  }

  // Handle relative URLs
  const searchAndHash = urlObj.search + urlObj.hash;
  const originalHadLeadingSlash = url.startsWith('/');
  
  // URL constructor ensures urlObj.pathname starts with '/'
  // If the original URL didn't have one, we should remove it from the result
  if (!originalHadLeadingSlash && urlObj.pathname.startsWith('/')) {
    return urlObj.pathname.substring(1) + searchAndHash;
  }

  return urlObj.pathname + searchAndHash;
}
