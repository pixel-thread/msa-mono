import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Meeting } from '../types';
import { useAuthStore } from '@src/shared/store';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';

/**
 * Fetches a single meeting by its unique identifier.
 *
 * Retrieves detailed information about a specific meeting including title,
 * description, agenda, type, status, venue, and creator information.
 * Requires the user to be authenticated and will not execute without a valid ID.
 *
 * @param id - The unique UUID identifier of the meeting to fetch
 *
 * @returns Query result containing the meeting details
 * @returns {Meeting} data - The meeting object with full details
 * @returns {boolean} isLoading - Whether the query is in loading state
 * @returns {boolean} isError - Whether an error occurred
 * @returns {Error} error - The error object if an error occurred
 *
 * @throws {Error} When user is not authenticated
 * @throws {Error} When meeting ID is not provided
 * @throws {Error} Network errors or API failures
 *
 * @example
 * ```typescript
 * const { data: meeting, isLoading, isError } = useMeeting('550e8400-e29b-41d4-a716-446655440000');
 *
 * if (isLoading) return <Spinner />;
 * if (isError) return <ErrorMessage error={error} />;
 *
 * return (
 *   <View>
 *     <Text>{meeting.title}</Text>
 *     <Text>{meeting.description}</Text>
 *     <Text>Status: {meeting.status}</Text>
 *     <Text>Venue: {meeting.venue}</Text>
 *   </View>
 * );
 * ```
 *
 * @example
 * // Using with route params (expo-router):
 * const { params } = useLocalSearchParams();
 * const { data: meeting } = useMeeting(params.meetingId);
 *
 * @see {@link https://docs.example.com/meetings/detail} Meeting detail API documentation
 * @see {@link useMeetings} For fetching multiple meetings
 */
export const useMeeting = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.DETAIL(id),
    select: (data) => data?.data,
    queryFn: async () => http.get<Meeting>(ENDPOINTS.MEETINGS.DETAIL(id)),
    enabled: isAuthenticated && !!id,
  });
};
