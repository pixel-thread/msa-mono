export const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  MFA_TEMP_TOKEN: 'mfa_temp_token',
  PUSH_TOKEN_KEY: 'push_token',
  PUSH_TOKEN_REGISTED_KEY: 'push_token_registed',
  PUSH_TOKEN_LINKED_KEY: 'push_token_linked',
} as const;

export type SecureStoreKey = (typeof SECURE_STORE_KEYS)[keyof typeof SECURE_STORE_KEYS];
