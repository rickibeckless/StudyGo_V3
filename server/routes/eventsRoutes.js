import express from 'express';
import { getEvents, getEventHost, createEvent } from '../controllers/eventsControllers.js';

const router = express.Router();

// /api/events

router.get('/', getEvents);
router.get('/:hostId', getEventHost);
router.post('/new', createEvent);

export default router;