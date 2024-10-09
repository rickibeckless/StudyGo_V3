import express from 'express';
import { getSubjects, getSubjectsById } from '../controllers/subjectsControllers.js';

const router = express.Router();

router.get('/', getSubjects);
router.get('/:subjectId', getSubjectsById);

export default router;
import { Router } from 'express';
