import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingEndpoints } from '../utils/constants';
import { MeetingQueryKeys } from '../utils/constants/query-key';
import { toast } from 'sonner-native';
import { UpdateAttendeeRsvpInput } from '../validators/rsvp';

type Props = {
  meetingId: string;
};

/**
 * Updates the RSVP status and note for a meeting attendee.
 *
 * Allows users to accept, decline, or update their RSVP status for a meeting.
 * Can also include an optional note explaining the RSVP decision.
 * Automatically invalidates the meeting RSVPs query cache.
 *
 * @param props - Configuration object containing meeting ID
 * @param props.meetingId - The unique UUID identifier of the meeting
 *
 * @returns Mutation object for updating attendee RSVP
 * @returns {MutateFunction} mutate - Function to trigger the mutation
 * @returns {MutateFunction} mutateAsync - Async version of mutate
 * @returns {boolean} isPending - Whether the mutation is in progress
 * @returns {boolean} isError - Whether an error occurred
 * @returns {boolean} isSuccess - Whether the mutation was successful
 * @returns {Error} error - The error object if an error occurred
 *
 * @param data - RSVP update data (all fields optional for partial updates)
 * @param data.userId - Optional override for user ID (defaults to current user)
 * @param data.rsvpStatus - RSVP status ('PENDING', 'ACCEPTED', 'DECLINED')
 * @param data.rsvpNote - Optional note explaining the RSVP decision (max 500 chars)
 *
 * @throws {Error} Network errors or API failures
 * @throws {Error} Invalid RSVP status value
 * @throws {Error} RSVP note exceeds maximum length
 *
 * @example
 * ```typescript
 * const rsvpMutation = useUpdateAttendeeRsvp({
 *   meetingId: '550e8400-e29b-41d4-a716-446655440000'
 * });
 *
 * // Accept invitation:
 * rsvpMutation.mutate({ rsvpStatus: 'ACCEPTED' });
 *
 * // Accept with note:
 * rsvpMutation.mutate({
 *   rsvpStatus: 'ACCEPTED',
 *   rsvpNote: 'I will attend and bring a guest'
 * });
 *
 * // Decline with explanation:
 * rsvpMutation.mutate({
 *   rsvpStatus: 'DECLINED',
 *   rsvpNote: 'Conflicting schedule with annual conference'
 * });
 *
 * if (rsvpMutation.isSuccess) {
 *   console.log('RSVP updated successfully');
 * }
 * ```
 *
 * @example
 * // RSVP status enum values:
 * const STATUS = {
 *   PENDING: 'PENDING',
 *   ACCEPTED: 'ACCEPTED',
 *   DECLINED: 'DECLINED'
 * };
 *
 * // Using in a UI component:
 * const RsvpButtons = () => (
 *   <View>
 *     <Button
 *       onPress={() => rsvpMutation.mutate({ rsvpStatus: 'ACCEPTED' })}
 *       disabled={rsvpMutation.isPending}
 *     >
 *       Accept
 *     </Button>
 *     <Button
 *       onPress={() => rsvpMutation.mutate({ rsvpStatus: 'DECLINED' })}
 *       disabled={rsvpMutation.isPending}
 *     >
 *       Decline
 *     </Button>
 *   </View>
 * );
 *
 * @see {@link https://docs.example.com/meetings/rsvp} RSVP API documentation
 * @see {@link useMeeting} For fetching meeting details
 */
export function useUpdateAttendeeRsvp({ meetingId }: Props) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAttendeeRsvpInput) =>
      http.post(meetingEndpoints.rsvp(meetingId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: MeetingQueryKeys.rsvps(meetingId) });
        queryClient.invalidateQueries({ queryKey: MeetingQueryKeys.all() });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
}
