import express from 'express';
import { getEvents, getEventHost, createEvent, updateEvent } from '../controllers/eventsControllers.js';

const router = express.Router();

// /api/events

router.get('/', getEvents);
router.get('/:hostId', getEventHost);
router.post('/new', createEvent);
router.patch('/:hostId/:eventId/update', updateEvent);

export default router;