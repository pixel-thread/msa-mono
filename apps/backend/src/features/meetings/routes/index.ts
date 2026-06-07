import { auth } from '@src/middleware/auth';
import { Router } from 'express';

import { postAddAgendaItem } from './agenda/add-agenda-item.route';
import { deleteAgendaItemHandler } from './agenda/delete-agenda-item.route';
import { getAgendaItems } from './agenda/list-agenda.route';
import { patchProcessAgendaOperations } from './agenda/process-agenda.route';
import { patchUpdateAgendaItem } from './agenda/update-agenda-item.route';
import { postAddAttendee } from './attendees/add-attendee.route';
import { postBulkAssignAttendees } from './attendees/bulk-assign.route';
import { putBulkAssignAttendees } from './attendees/bulk-assign-put.route';
import { getAttendees } from './attendees/list-attendees.route';
import { deleteRemoveAttendee, patchUpdateAttendee } from './attendees/remove-attendee.route';
import { postCreateMinute } from './minutes/add-minutes.route';
import { deleteMinute } from './minutes/delete-minutes.route';
import { getMinutes } from './minutes/list-minutes.route';
import { patchUpdateMinute } from './minutes/update-minutes.route';
import { postRsvp } from './rsvp/rsvp.route';
import { postCancelMeeting } from './cancel-meeting.route';
import { postCreateMeeting } from './create-meeting.route';
import { deleteMeetingHandler } from './delete-meeting.route';
import { getMeeting } from './get-meeting.route';
import { getMeetings } from './get-meetings.route';
import { getMyMeetings } from './get-my-meetings.route';
import { postIssueNotice } from './issue-notice.route';
import { getMeetingReport } from './report.route';
import { patchUpdateMeeting } from './update-meeting.route';

/** Meetings feature router - aggregates all meeting-related routes. */
const router: Router = Router();
router.use(auth);
// Static routes must be defined before parameterized routes
router.get('/my', getMyMeetings);

// Meeting CRUD
router.get('/', getMeetings);
router.post('/', postCreateMeeting);
router.get('/:meetingId', getMeeting);
router.patch('/:meetingId', patchUpdateMeeting);
router.delete('/:meetingId', deleteMeetingHandler);

// Meeting actions
router.post('/:meetingId/cancel', postCancelMeeting);
router.post('/:meetingId/notice', postIssueNotice);

// Attendees
router.get('/:meetingId/attendees', getAttendees);
router.post('/:meetingId/attendees', postAddAttendee);
router.put('/:meetingId/attendees', putBulkAssignAttendees);
router.post('/:meetingId/attendees/bulk', postBulkAssignAttendees);
router.patch('/:meetingId/attendees/:userId', patchUpdateAttendee);
router.delete('/:meetingId/attendees/:userId', deleteRemoveAttendee);

// RSVP
router.post('/:meetingId/rsvp', postRsvp);

// Agenda
router.get('/:meetingId/agenda', getAgendaItems);
router.post('/:meetingId/agenda', postAddAgendaItem);
router.patch('/:meetingId/agenda', patchProcessAgendaOperations);
router.patch('/:meetingId/agenda/:itemId', patchUpdateAgendaItem);
router.delete('/:meetingId/agenda/:itemId', deleteAgendaItemHandler);

// Minutes
router.get('/:meetingId/minutes', getMinutes);
router.post('/:meetingId/minutes', postCreateMinute);
router.patch('/:meetingId/minutes/:minutesId', patchUpdateMinute);
router.delete('/:meetingId/minutes/:minutesId', deleteMinute);

// Report
router.get('/:meetingId/report', getMeetingReport);

export default router;
