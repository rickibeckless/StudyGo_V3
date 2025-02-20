import express from 'express';
import { 
    addClass, getClasses, getClassById, 
    getClassesBySubject, getUnitsByClass, 
    getUnitsById, deleteClassById
} from '../controllers/classesControllers.js';

const router = express.Router();

// /api/classes

router.get('/', getClasses);
router.get('/:subjectId/:classId', getClassById);
router.get('/:subjectId', getClassesBySubject);
router.post('/:subjectId/new', addClass);
//router.get('/:subjectId/:classId', getUnitsByClass);
router.get('/:subjectId/:classId/:unitId', getUnitsById);
router.delete('/:classId', deleteClassById);

export default router;