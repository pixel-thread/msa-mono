import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { meetingEndpoints } from '../utils/constants';
import { MeetingQueryKeys } from '../utils/constants/query-key';
import { toast } from 'sonner-native';

type Props = {
  meetingId: string;
};

/**
 * Deletes a meeting minute from a specific meeting.
 *
 * Removes a minute record from the meeting. Automatically invalidates the
 * meeting minutes query cache to ensure the list reflects the deletion.
 *
 * @param props - Configuration object containing meeting ID
 * @param props.meetingId - The unique UUID identifier of the parent meeting
 *
 * @returns Mutation object for deleting meeting minutes
 * @returns {MutateFunction} mutate - Function to trigger the mutation
 * @returns {MutateFunction} mutateAsync - Async version of mutate
 * @returns {boolean} isPending - Whether the mutation is in progress
 * @returns {boolean} isError - Whether an error occurred
 * @returns {boolean} isSuccess - Whether the mutation was successful
 * @returns {Error} error - The error object if an error occurred
 *
 * @param meetingMinuteId - The unique UUID identifier of the minute to delete
 *
 * @throws {Error} Network errors or API failures
 * @throws {Error} When minute not found or unauthorized
 *
 * @example
 * ```typescript
 * const deleteMinuteMutation = useDeleteMeetingMinute({
 *   meetingId: '550e8400-e29b-41d4-a716-446655440000'
 * });
 *
 * // In your delete button onClick handler:
 * const handleDelete = (minuteId: string) => {
 *   Alert.alert(
 *     'Delete Minute',
 *     'Are you sure you want to delete this minute?',
 *     [
 *       { text: 'Cancel', style: 'cancel' },
 *       {
 *         text: 'Delete',
 *         style: 'destructive',
 *         onPress: () => deleteMinuteMutation.mutate(minuteId)
 *       }
 *     ]
 *   );
 * };
 *
 * // Access success state:
 * if (deleteMinuteMutation.isSuccess) {
 *   Alert.alert('Success', 'Minute deleted successfully');
 * }
 * ```
 *
 * @example
 * // Using with confirmation dialog:
 * const handleDeleteMinute = async (minuteId: string) => {
 *   const confirmed = await showDeleteConfirmation();
 *   if (confirmed) {
 *     deleteMinuteMutation.mutate(minuteId);
 *   }
 * };
 *
 * @see {@link https://docs.example.com/meetings/minutes/delete} Delete minute API documentation
 * @see {@link useMeetingMinute} For fetching the remaining minutes after deletion
 * @see {@link useCreateMeetingMinute} For creating new minutes
 * @see {@link useUpdateMeetingMinute} For updating existing minutes
 */
export function useDeleteMeetingMinute({ meetingId }: Props) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingMinuteId: string) =>
      http.delete(meetingEndpoints.minute(meetingId, meetingMinuteId)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Minute deleted successfully');
        queryClient.invalidateQueries({ queryKey: MeetingQueryKeys.minutes(meetingId) });
        return data;
      }
      toast.error(data.message || 'Failed to delete minute');
      return data;
    },
  });
};