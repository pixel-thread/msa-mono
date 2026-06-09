export type DeclarationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DeclarationMember {
  name: string;
  email: string;
  mobile: string;
}

export interface Declaration {
  id: string;
  memberId: string;
  associationId: string;
  declerationStartDate: string;
  declerationEndDate: string;
  amount: string;
  status: DeclarationStatus;
  lastDeclarationDate: string | null;
  reviewBy: string | null;
  reviewAt: string | null;
  remark: string | null;
  member: DeclarationMember;
}
