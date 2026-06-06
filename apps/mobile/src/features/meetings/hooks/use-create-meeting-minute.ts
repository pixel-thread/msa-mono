import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMeetingMinuteInput } from '../validators/minuites';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { toast } from 'sonner-native';

type Props = {
  meetingId: string;
};

/**
 * Creates a new meeting minute for a specific meeting.
 *
 * Submits a new minute record containing agenda points, decisions, and optional
 * action items to the meeting. Automatically invalidates the meeting minutes
 * query cache to ensure the list reflects the new entry.
 *
 * @param props - Configuration object containing meeting ID
 * @param props.meetingId - The unique UUID identifier of the meeting
 *
 * @returns Mutation object for creating meeting minutes
 * @returns {MutateFunction} mutate - Function to trigger the mutation
 * @returns {MutateFunction} mutateAsync - Async version of mutate
 * @returns {boolean} isPending - Whether the mutation is in progress
 * @returns {boolean} isError - Whether an error occurred
 * @returns {boolean} isSuccess - Whether the mutation was successful
 * @returns {Error} error - The error object if an error occurred
 *
 * @param data - The minute data to create
 * @param data.agendaPoint - The agenda point being discussed (required, non-empty string)
 * @param data.decision - The decision made on the agenda point (required, non-empty string)
 * @param data.actionItems - Optional array of action items with assignee, task, and due date
 *
 * @throws {Error} Network errors or API failures
 * @throws {Error} Validation errors (missing required fields)
 *
 * @example
 * ```typescript
 * const createMinuteMutation = useCreateMeetingMinute({
 *   meetingId: '550e8400-e29b-41d4-a716-446655440000'
 * });
 *
 * // In your form submission handler:
 * createMinuteMutation.mutate({
 *   agendaPoint: 'Budget Approval for 2024',
 *   decision: 'Approved budget allocation of $50,000',
 *   actionItems: [
 *     {
 *       assigneeId: 'user-uuid-here',
 *       task: 'Prepare final budget document',
 *       dueDate: '2024-03-15'
 *     }
 *   ]
 * });
 *
 * if (createMinuteMutation.isSuccess) {
 *   console.log('Minute created successfully');
 * }
 * ```
 *
 * @example
 * // Simple minute without action items:
 * createMinuteMutation.mutate({
 *   agendaPoint: 'Venue Selection',
 *   decision: 'Downtown Conference Center selected'
 * });
 *
 * @see {@link https://docs.example.com/meetings/minutes/create} Create minute API documentation
 * @see {@link useMeetingMinute} For fetching the minutes list after creation
 * @see {@link useUpdateMeetingMinute} For updating existing minutes
 * @see {@link useDeleteMeetingMinute} For deleting minutes
 */
export const useCreateMeetingMinute = ({ meetingId }: Props) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingMinuteInput) =>
      http.post(ENDPOINTS.MEETINGS.MINUTES.LIST(meetingId), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.MINUTES(meetingId) });
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });
};