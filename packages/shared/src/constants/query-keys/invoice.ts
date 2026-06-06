export const INVOICE_KEYS = {
  ALL:    () => ['invoices'].filter(Boolean),
  LIST:   (page?: number) => ['invoices', page].filter(Boolean),
  DETAIL: (id: string) => ['invoice', id].filter(Boolean),
}
