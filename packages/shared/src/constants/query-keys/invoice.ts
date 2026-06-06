export const INVOICE_KEYS = {
  ALL:    () => ['invoices'] as const,
  LIST:   (page?: number) => ['invoices', page] as const,
  DETAIL: (id: string) => ['invoice', id] as const,
}
