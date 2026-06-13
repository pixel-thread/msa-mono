import { getRouteApi } from '@tanstack/react-router';
export const plansRouteApi = getRouteApi('/_dashboard/plans/');
export const planRouteApi = getRouteApi('/_dashboard/plans/$planId/');
