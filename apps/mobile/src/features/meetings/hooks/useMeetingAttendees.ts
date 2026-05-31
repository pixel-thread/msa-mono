import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { useAuthStore } from '@src/shared/store';
import { MeetingAttendee } from '../types/attendee';
import { meetingEndpoints } from '../utils/constants';
import { MeetingQueryKeys } from '../utils/constants/query-key';

/**
 * Hook to fetch a single meeting by ID.
 *
 * @param id - The ID of the meeting to fetch
 * @returns Query result containing the meeting data
 */
export const useMeetingAttendees = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: MeetingQueryKeys.attendees(id),
    select: (data) => data?.data,
    queryFn: () => http.get<MeetingAttendee[]>(meetingEndpoints.attendees(id)),
    enabled: isAuthenticated && !!id,
  });
};
