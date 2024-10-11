import express from 'express';
import { getTopics, addTopic, addLessonToTopic, deleteLessonFromTopic, getTopicsById } from '../controllers/topicsControllers.js';

const router = express.Router();

// /api/topics

router.get('/', getTopics);
router.post('/:subjectId/:classId/:unitId/new', addTopic);

router.post('/:subjectId/:classId/:unitId/:topicId/new-sub-topic', addLessonToTopic);
router.delete('/:subjectId/:classId/:unitId/:topicId/delete-sub-topic', deleteLessonFromTopic);

router.get('/:subjectId/:classId/:unitId', getTopicsById);

export default router;