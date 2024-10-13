import express from 'express';
import { getEvents, getEventHost, getEventAttendees, registerAttendee, createEvent, updateEvent } from '../controllers/eventsControllers.js';

const router = express.Router();

// /api/events

// general events routes
router.get('/', getEvents); // get all events
router.post('/new', createEvent); // create new event

// hosts routes
router.get('/:hostId', getEventHost); // get host info by host id
router.patch('/:hostId/:eventId/update', updateEvent); // update event by host id and event id

// attendees routes
router.get('/:eventId/attendees', getEventAttendees); // get all attendees for an event by event id
router.post('/:eventId/register', registerAttendee); // register an attendee for an event by event id

export default router;