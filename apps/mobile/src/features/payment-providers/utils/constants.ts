export const paymentProviderEndpoints = {
  list: '/payments/providers',
  add: '/payments/providers',
  detail: (id: string) => `/payments/providers/${id}`,
  update: (id: string) => `/payments/providers/${id}`,
  delete: (id: string) => `/payments/providers/${id}`,
  activate: (id: string) => `/payments/providers/${id}/activate`,
};

