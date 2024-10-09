import { pool } from '../config/database.js';
import { generateUniqueStringId, getAllUniqueIds } from '../data/allUniqueIds.js';

export const getUnits = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM units');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

export const addUnit = async (req, res) => {
    try {
        const { subjectId, classId } = req.params;
        const { name, description, learningObjectives, unitOutcomes, prerequisites } = req.body;

        const newUniqueId = generateUniqueStringId();

        const existingUniqueIds = await getAllUniqueIds();

        if (existingUniqueIds.includes(newUniqueId)) {
            return res.status(400).json({ message: 'The unique_string_id already exists.' });
        };

        const results = await pool.query(
            'INSERT INTO units (subjectid, classid, name, description, learning_objectives, unit_outcomes, prerequisites, unique_string_id) VALUES ($1, $2, $3, $4, $5::text[], $6, $7, $8) RETURNING *', 
            [subjectId, classId, name, description, learningObjectives, unitOutcomes, prerequisites, newUniqueId]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding unit:', error);
        res.status(500).json({ message: 'Error adding unit', error });
    }
};

export const getUnitById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM units WHERE unique_string_id = $1', [req.params.unitId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

export const getTopicById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM topics WHERE unique_string_id = $1', [req.params.topicId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};