export interface RazorpayOptions {
  description: string;
  image?: string;
  currency: string;
  key: string;
  amount: number;
  name: string;
  transaction_id?: string;

  order_id: string;
  receipt?: string;

  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };

  theme?: {
    color?: string;
  };

  notes?: Record<string, string>;

  retry?: {
    enabled: boolean;
    max_count: number;
  };

  modal?: {
    confirm_close: boolean;
    animation: boolean;
    ondismiss: () => void;
  };

  timeout?: number;

  readonly?: {
    contact: boolean;
    email: boolean;
    name: boolean;
  };

  hide_topbar?: boolean;

  method?: 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi';

  send_sms_hash?: boolean;

  remember_customer?: boolean;

  customer_id?: string;

  subscription_id?: string;

  config?: {
    display: {
      language: 'en' | 'ben' | 'hi' | 'mar' | 'guj' | 'tam' | 'tel';
    };
  };

  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
}
type RazorpayError = {
  code: number;
  description: string;

  error: {
    code: string;
    description: string;
    metadata: Record<string, unknown>;
    reason: string;
    source: string;
    step: string;
  };
};

export function isRazorpayError(error: unknown): error is RazorpayError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'description' in error &&
    'error' in error
  );
}
