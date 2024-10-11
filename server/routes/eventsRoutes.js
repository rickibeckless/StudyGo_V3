import express from 'express';
import { getEvents } from '../controllers/eventsControllers.js';

const router = express.Router();

router.get('/', getEvents);

export default router;