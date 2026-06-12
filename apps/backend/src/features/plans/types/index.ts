import type { Plan, PlanVersion } from '@prisma/client';

export type { Plan, PlanVersion };

/** Plan with its active version (used in list views). */
export type PlanWithActiveVersion = Plan & {
  activeVersion: PlanVersion | null;
};

/** Plan with all versions (used in detail views). */
export type PlanWithVersions = Plan & {
  versions: PlanVersion[];
};
