import express from 'express';
import { pool } from '../config/database.js';

const router = express.Router();

const validUrls = ['subjects', 'classes', 'units'];

const isValidUrl = (url) => {
    return validUrls.includes(url);
};

async function isValidSubject(subjectId) {
    const validSubject = await pool.query('SELECT * FROM subjects WHERE unique_string_id = $1', [subjectId]);
    if (!validSubject) {
        return false;
    };

    return true;
};

async function isValidClass(subjectId, classId) {
    const validClass = await pool.query('SELECT * FROM classes WHERE unique_string_id = $1 AND subjectid = $2', [classId, subjectId]);
    if (!validClass) {
        return false;
    };

    return true;
};

async function isValidUnit(subjectId, classId, unitId) {
    const validUnit = await pool.query('SELECT * FROM units WHERE unique_string_id = $1 AND classid = $2 AND subjectid = $3', [unitId, classId, subjectId]);
    if (!validUnit) {
        return false;
    };

    return true;
};

// /api/validate

router.get('/subject/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
    const validSubject = await isValidSubject(subjectId);
    if (validSubject) {
        return res.status(200).json({ valid: true });
    }
    return res.status(404).json({ valid: false });
});

router.get('/class/:subjectId/:classId', async (req, res) => {
    const { subjectId, classId } = req.params;
    const validClass = await isValidClass(subjectId, classId);
    if (validClass) {
        return res.status(200).json({ valid: true });
    }
    return res.status(404).json({ valid: false });
});

router.get('/unit/:subjectId/:classId/:unitId', async (req, res) => {
    const { subjectId, classId, unitId } = req.params;
    const validUnit = await isValidUnit(subjectId, classId, unitId);
    if (validUnit) {
        return res.status(200).json({ valid: true });
    }
    return res.status(404).json({ valid: false });
});

export default router;