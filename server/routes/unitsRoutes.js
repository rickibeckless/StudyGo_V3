import express from 'express';
import { 
    getUnits, 
    addUnit, getUnitsByClassId, 
    getUnitById, 
    updateUnitStatus, 
    getTopicById,
    deleteUnit
} from '../controllers/unitsControllers.js';

const router = express.Router();

// /api/units

router.get('/', getUnits);
router.post('/:subjectId/:classId/new', addUnit);
router.get('/:subjectId/:classId', getUnitsByClassId);
router.get('/:subjectId/:classId/:unitId', getUnitById);
router.patch('/:subjectId/:classId/:unitId/status', updateUnitStatus);
router.get('/:subjectId/:classId/:unitId/:topicId', getTopicById);

router.delete('/:unitId/delete', deleteUnit);

export default router;