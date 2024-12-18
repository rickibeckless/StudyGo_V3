import express from 'express';
import { 
    getSubjects, 
    getSubjectsById,
    createSubject
} from '../controllers/subjectsControllers.js';

const router = express.Router();

// /api/subjects

router.get('/', getSubjects);
router.get('/:subjectId', getSubjectsById);
router.post('/new', createSubject);

export default router;