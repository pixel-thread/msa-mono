export const formattedDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export const formattedTime = (date: Date) =>
  date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export function formatSubscriptionBillingCycle(cycle: 'MONTHLY' | 'YEARLY'): string {
  const map: Record<string, string> = {
    MONTHLY: 'month',
    QUARTERLY: 'quarter',
    HALF_YEARLY: '6 months',
    YEARLY: 'year',
    LIFETIME: 'lifetime',
  };
  return map[cycle] ?? cycle?.toLowerCase();
}
