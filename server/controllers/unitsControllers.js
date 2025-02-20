import { pool } from '../config/database.js';

export const getUnits = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM units');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ message: 'Error fetching units', error });
    };
};

export const getUnitsByClassId = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM units WHERE classid = $1', [req.params.classId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching units by class id:', error);
        res.status(500).json({ message: 'Error fetching units by class id', error });
    };
};

export const addUnit = async (req, res) => {
    try {
        const { subjectId, classId } = req.params;
        let { name, description, learning_objectives, unit_outcomes, prerequisites, unit_index } = req.body;

        learning_objectives = learning_objectives.split('\n').map((objective) => objective.trim());

        const results = await pool.query(
            'INSERT INTO units (subjectid, classid, name, description, learning_objectives, unit_outcomes, prerequisites, unit_index) VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8) RETURNING *', 
            [subjectId, classId, name, description, learning_objectives, unit_outcomes, prerequisites, unit_index]
        );

        await pool.query('UPDATE classes SET date_updated = NOW() WHERE unique_string_id = $1', [classId]);

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding unit:', error);
        res.status(500).json({ message: 'Error adding unit', error });
    };
};

export const getUnitById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM units WHERE unique_string_id = $1', [req.params.unitId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ message: 'Unit not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching unit by ID:', error);
        res.status(500).json({ message: 'Error fetching unit by ID', error });
    };
};

export const updateUnitStatus = async (req, res) => {
    try {
        const results = await pool.query('UPDATE units SET status = $1 WHERE unique_string_id = $2 RETURNING *', [req.body.status, req.params.unitId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating unit status:', error);
        res.status(500).json({ message: 'Error updating unit status', error });
    };
};

export const getTopicById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM topics WHERE unique_string_id = $1', [req.params.topicId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        };

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching topic by ID:', error);
        res.status(500).json({ message: 'Error fetching topic by ID', error });
    };
};

export const deleteUnit = async (req, res) => {
    try {
        const { unitId } = req.params;

        const unitExists = await pool.query('SELECT * FROM units WHERE unique_string_id = $1', [unitId]);

        if (unitExists.rows.length === 0) {
            return res.status(404).json({ message: 'Unit not found' });
        };
        await pool.query('UPDATE classes SET date_updated = NOW() WHERE unique_string_id = $1', [unitExists.classid]);

        const results = await pool.query('DELETE FROM units WHERE unique_string_id = $1 RETURNING *', [unitId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting topic by ID:', error);
        res.status(500).json({ message: 'Error deleting topic by ID', error });
    };
};