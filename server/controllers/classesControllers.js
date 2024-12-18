import { pool } from '../config/database.js';

export const getClasses = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM classes');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getClassById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM classes WHERE unique_string_id = $1', [req.params.classId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching class by ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const addClass = async (req, res) => {    
    try {
        const subjectId = req.params.subjectId;
        const { name, description, class_index } = req.body;

        const results = await pool.query(
            'INSERT INTO classes (subjectid, name, description, class_index) VALUES ($1, $2, $3, $4) RETURNING *', 
            [subjectId, name, description, class_index]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ message: 'Error adding class', error });
    };
};

export const updateClass = async (req, res) => {
    try {
        const { classId, name, description } = req.body;

        const currentTimestamp = new Date();

        const results = await pool.query(
            'UPDATE classes SET name = $1, description = $2, date_updated = $3 WHERE unique_string_id = $4 RETURNING *', 
            [name, description, currentTimestamp, classId]
        );

        if (results.rows.length === 0) {
            return res.status(404).json({ message: 'Class not found.' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Error updating class', error });
    };
};

export const getClassesBySubject = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM classes WHERE subjectid = $1', [req.params.subjectId]);

        if (results.rows.length === 0) {
            return res.status(204).send();
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching classes by subject ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getUnitsByClass = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const classId = req.params.classId;

        const results = await pool.query('SELECT * FROM units WHERE classid = $1', [classId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Units not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error getting units by class:', error);
        res.status(500).json({ message: 'Error getting units by class', error });
    };
};

export const getUnitsById = async (req, res) => {
    try {
        const { subjectId, classId, unitId } = req.params;
        const results = await pool.query('SELECT * FROM topics WHERE unitid = $1', [unitId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Units not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching units by ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};