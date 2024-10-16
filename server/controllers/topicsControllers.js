import { pool } from '../config/database.js';
import { generateUniqueStringId, getAllUniqueIds } from '../data/allUniqueIds.js';

export const getTopics = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM topics');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Error fetching topics', error });
    };
};

export const addTopic = async (req, res) => {
    try {
        const { subjectId, classId, unitId } = req.params;
        const { name, description, notes, termdefs, lessons } = req.body;

        const newUniqueId = generateUniqueStringId();

        const existingUniqueIds = await getAllUniqueIds();

        if (existingUniqueIds.includes(newUniqueId)) {
            return res.status(400).json({ message: 'The unique_string_id already exists.' });
        };

        const results = await pool.query(
            'INSERT INTO topics (subjectid, classid, unitid, name, description, notes, terms_defs, lessons) VALUES ($1, $2, $3, $4, $5, $6::text[], $7::text[], $8::text[]) RETURNING *',
            [subjectId, classId, unitId, name, description, notes, termdefs, lessons]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding topic:', error);
        res.status(500).json({ message: 'Error adding topic', error });
    }
};

export const addLessonToTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        let { lesson } = req.body;

        const newUniqueId = generateUniqueStringId();

        const existingUniqueIds = await getAllUniqueIds();

        if (existingUniqueIds.includes(newUniqueId)) {
            return res.status(400).json({ message: 'The unique_string_id already exists.' });
        }

        // i need to edit this as generating a new unique id isn't necessary

        lesson = {
            ...lesson,
            unique_string_id: newUniqueId
        };

        const results = await pool.query(
            'UPDATE topics SET lessons = lessons || $1::jsonb WHERE unique_string_id = $2 RETURNING *',
            [JSON.stringify(lesson), topicId]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding lesson to topic:', error);
        res.status(500).json({ message: 'Error adding lesson to topic', error });
    }
};

export const deleteLessonFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { lessonId } = req.body;

        const query = `
            UPDATE topics 
            SET lessons = (
                SELECT jsonb_agg(lesson) 
                FROM jsonb_array_elements(lessons) AS lesson 
                WHERE lesson->>'unique_string_id' != $1
            ) 
            WHERE unique_string_id = $2
            RETURNING *;
        `;

        const results = await pool.query(query, [lessonId, topicId]);

        if (results.rowCount === 0) {
            return res.status(404).json({ message: 'Topic or lesson not found' });
        }

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting lesson from topic:', error);
        res.status(500).json({ message: 'Error deleting lesson from topic', error });
    }
};

export const getTopicsById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM topics WHERE unitid = $1', [req.params.unitId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching topic by unit id:', error);
        res.status(500).json({ message: 'Error fetching topic by unit id', error });
    };
};