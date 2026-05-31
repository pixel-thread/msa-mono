import { Transaction, Allocation } from '@src/features/subscription/types/payment';
import { AssociationT } from '@src/shared/types/association';
import { IUser } from '@src/shared/types/user';

export type InvoiceUser = Pick<IUser, 'name' | 'email' | 'designation'> & {
  membershipNumber?: string;
};

export type Invoice = Transaction & {
  user: InvoiceUser;
  association: AssociationT; // Using any or defining a basic association type
  allocations: Allocation[];
};
