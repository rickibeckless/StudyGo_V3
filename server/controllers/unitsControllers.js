import { pool } from '../config/database.js';
import { generateUniqueStringId, getAllUniqueIds } from '../data/allUniqueIds.js';

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
        const { name, description, learningObjectives, unitOutcomes, prerequisites } = req.body;

        const newUniqueId = generateUniqueStringId();

        const existingUniqueIds = await getAllUniqueIds();

        if (existingUniqueIds.includes(newUniqueId)) {
            return res.status(400).json({ message: 'The unique_string_id already exists.' });
        };

        const results = await pool.query(
            'INSERT INTO units (subjectid, classid, name, description, learning_objectives, unit_outcomes, prerequisites) VALUES ($1, $2, $3, $4, $5::text[], $6, $7) RETURNING *', 
            [subjectId, classId, name, description, learningObjectives, unitOutcomes, prerequisites]
        );

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