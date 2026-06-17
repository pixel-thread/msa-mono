import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation } from '@tanstack/react-query';

import { TransferAccountBalanceInput } from '../validators';

export function useTransferAccountBalance() {
  return useMutation({
    mutationFn: (data: TransferAccountBalanceInput) => http.post(ENDPOINTS.PAYMENTS.TRANSFER, data),
  });
}
