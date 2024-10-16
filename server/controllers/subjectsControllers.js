import { pool } from '../config/database.js';

export const getSubjects = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM subjects');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getSubjectsById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM subjects WHERE unique_string_id = $1', [req.params.subjectId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching subject by ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};