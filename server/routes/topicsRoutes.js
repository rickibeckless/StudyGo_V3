import express from 'express';
import { 
    getTopics, 
    getTopicsById,
    addTopic, 
    addNoteToTopic,
    updateNoteFromTopic,
    deleteNoteFromTopic,
    addTermDefToTopic,
    updateTermDefFromTopic,
    deleteTermDefFromTopic,
    addLessonToTopic, 
    updateLessonFromTopic, 
    deleteLessonFromTopic
} from '../controllers/topicsControllers.js';

const router = express.Router();

// /api/topics

router.get('/', getTopics);
router.get('/:subjectId/:classId/:unitId', getTopicsById);
router.post('/:subjectId/:classId/:unitId/new', addTopic);

// note routes
router.patch('/:subjectId/:classId/:unitId/:topicId/new/note', addNoteToTopic);
router.patch('/:subjectId/:classId/:unitId/:topicId/update/note', updateNoteFromTopic);
router.delete('/:subjectId/:classId/:unitId/:topicId/delete/note', deleteNoteFromTopic);

// termdef routes
router.patch('/:subjectId/:classId/:unitId/:topicId/new/termdef', addTermDefToTopic);
router.patch('/:subjectId/:classId/:unitId/:topicId/update/termdef', updateTermDefFromTopic);
router.delete('/:subjectId/:classId/:unitId/:topicId/delete/termdef', deleteTermDefFromTopic);


// lesson routes
router.patch('/:subjectId/:classId/:unitId/:topicId/new/lesson', addLessonToTopic);
router.patch('/:subjectId/:classId/:unitId/:topicId/update/lesson', updateLessonFromTopic);
router.delete('/:subjectId/:classId/:unitId/:topicId/delete/lesson', deleteLessonFromTopic);

export default router;