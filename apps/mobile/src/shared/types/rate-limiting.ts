export interface IRateLimitOptions {
  limit: number;
  windowMs: number;
  message?: string;
}
