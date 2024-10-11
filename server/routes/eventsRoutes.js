import express from 'express';
import { getEvents, createEvent } from '../controllers/eventsControllers.js';

const router = express.Router();

// /api/events

router.get('/', getEvents);
router.post('/new', createEvent);

export default router;