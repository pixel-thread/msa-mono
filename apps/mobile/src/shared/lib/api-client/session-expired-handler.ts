let handler: (() => void) | null = null;

export function setSessionExpiredHandler(newHandler: (() => void) | null): void {
  handler = newHandler;
}

export function triggerSessionExpired(): void {
  handler?.();
}
