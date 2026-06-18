import { ContributionPeriod } from './index';

type RetroActiveUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  middleName: string | null;
  lastName: string | null;
  mobile: string;
  designation: string;
  memberTypeId: string;
};

export type RetroactiveAdjustmentRecord = {
  id: string;
  retroactiveAdjustmentId: string;
  userId: string;
  contributionPeriodId: string;
  previousExpectedAmount: string;
  newExpectedAmount: string;
  adjustmentAmount: string;
  createdAt: string;
  user: RetroActiveUser;
  contributionPeriod: ContributionPeriod;
  retroactiveAdjustment: RetroactiveAdjustment;
};

export type RetroactiveAdjustment = {
  id: string;
  associationId: string;
  planId: string;
  planVersionId: string;
  oldAmount: string;
  newAmount: string;
  effectiveFrom: string;
  effectiveTo: string;
  createdAt: string;
};
