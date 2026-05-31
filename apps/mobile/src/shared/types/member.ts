export type MemberType = {
  id: string;
  description: string;
  level: number;
  associationId: string;
  _count: {
    users: number;
    subscriptionPlans: number;
  };
};
