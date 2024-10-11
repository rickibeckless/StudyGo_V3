import { pool } from '../config/database.js';

export const getSubjects = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM subjects');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

export const getSubjectsById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM subjects WHERE unique_string_id = $1', [req.params.subjectId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};