import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { meetingEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { MeetingMinute } from '../types/minute';

type Props = {
  meetingId: string;
};

/**
 * Fetches the list of meeting minutes for a specific meeting.
 *
 * Retrieves all recorded minutes (agenda points, decisions, and action items)
 * associated with a given meeting. Minutes are returned in chronological order
 * based on when they were recorded.
 *
 * @param props - Configuration object containing meeting ID
 * @param props.meetingId - The unique UUID identifier of the meeting
 *
 * @returns Query result containing the meeting minutes
 * @returns {MeetingMinute[]} data - Array of minute objects
 * @returns {boolean} isLoading - Whether the query is in loading state
 * @returns {boolean} isError - Whether an error occurred
 * @returns {Error} error - The error object if an error occurred
 *
 * @throws {Error} When meeting ID is not provided
 * @throws {Error} Network errors or API failures
 *
 * @example
 * ```typescript
 * const { data: minutes, isLoading, isError } = useMeetingMinute({
 *   meetingId: '550e8400-e29b-41d4-a716-446655440000'
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (isError) return <ErrorMessage error={error} />;
 *
 * return (
 *   <FlatList
 *     data={minutes}
 *     keyExtractor={(item) => item.id}
 *     renderItem={({ item }) => (
 *       <MinuteCard
 *         agendaPoint={item.agendaPoint}
 *         decision={item.decision}
 *         actionItems={item.actionItems}
 *       />
 *     )}
 *   />
 * );
 * ```
 *
 * @example
 * // Using with meeting detail hook:
 * const meeting = useMeeting(meetingId);
 * const minutes = useMeetingMinute({ meetingId });
 *
 * return (
 *   <>
 *     <MeetingHeader meeting={meeting.data} />
 *     <MinutesList minutes={minutes.data} />
 *   </>
 * );
 * ```
 *
 * @see {@link https://docs.example.com/meetings/minutes} Meeting minutes API documentation
 * @see {@link useMeeting} For fetching the parent meeting details
 * @see {@link useCreateMeetingMinute} For creating a new minute
 * @see {@link useUpdateMeetingMinute} For updating existing minutes
 */
export function useMeetingMinute({ meetingId }: Props) {
  return useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId),
    queryFn: () => http.get<MeetingMinute[]>(meetingEndpoints.minutes(meetingId)),
    select: (data) => data.data,
    enabled: !!meetingId,
  });
}