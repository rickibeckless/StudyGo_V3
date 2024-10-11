import { pool } from '../config/database.js';
import { generateUniqueStringId, getAllUniqueIds } from '../data/allUniqueIds.js';

export const getClasses = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM classes');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// Route to add a new class
export const addClass = async (req, res) => {    
    try {
        const subjectId = req.params.subjectId;
        const { name, description } = req.body;
        
        const newUniqueId = generateUniqueStringId();
        
        const existingUniqueIds = await getAllUniqueIds();

        if (existingUniqueIds.includes(newUniqueId)) {
            return res.status(400).json({ message: 'The unique_string_id already exists.' });
        }

        const currentTimestamp = new Date();

        const results = await pool.query(
            'INSERT INTO classes (subjectid, name, description, unique_string_id, date_created, date_updated) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
            [subjectId, name, description, newUniqueId, currentTimestamp, currentTimestamp]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ message: 'Error adding class', error });
    }
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
        }

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Error updating class', error });
    }
};


// Route to get classes by subject id
export const getClassesBySubject = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM classes WHERE subjectid = $1', [req.params.subjectId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// Route to get units by class id
export const getUnitsByClass = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const classId = req.params.classId;

        const results = await pool.query('SELECT * FROM units WHERE classid = $1', [classId]);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error getting units by class:', error);
        res.status(500).json({ message: 'Error getting units by class', error });
    }
};

// Route to get units by unit id
export const getUnitsById = async (req, res) => {
    try {
        const { subjectId, classId, unitId } = req.params;
        const results = await pool.query('SELECT * FROM topics WHERE unitid = $1', [unitId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};