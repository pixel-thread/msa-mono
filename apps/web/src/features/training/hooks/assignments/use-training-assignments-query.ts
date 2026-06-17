import { buildUrlWithQuery, ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import type { TrainingAssignment } from '../../types';
import { trainingQueryKeys } from '../../utils/constants';

type Props = {
  page?: number;
  moduleId: string;
};
export function useTrainingAssignmentsQuery({ page = 1, moduleId }: Props) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: trainingQueryKeys.assignments.all(moduleId, page),
    queryFn: async () =>
      http.get<TrainingAssignment[]>(
        buildUrlWithQuery(ENDPOINTS.TRAINING.MODULE_ASSIGN(moduleId!), { page }),
      ),
    enabled: !!moduleId,
  });

  const assignmentDeta = data?.data;
  const meta = data?.meta;
  return {
    assignments: assignmentDeta ?? [],
    assignmentMeta: meta,
    isLoading,
    refetch,
  };
}
