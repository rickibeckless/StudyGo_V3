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

export const getTopicsById = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM topics WHERE unitid = $1', [req.params.unitId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching topic by unit id:', error);
        res.status(500).json({ message: 'Error fetching topic by unit id', error });
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
    };
};

{/* Sub-Topic Controllers */}

// Note Controllers
export const addNoteToTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { note } = req.body;

        console.log(topicId, note);

        const results = await pool.query(
            'UPDATE topics SET notes = notes || $1::jsonb WHERE unique_string_id = $2 RETURNING *',
            [JSON.stringify(note), topicId]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding note to topic:', error);
        res.status(500).json({ message: 'Error adding note to topic', error });
    };
};

export const updateNoteFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { oldNote, newNote } = req.body;

        const fetchQuery = `SELECT notes FROM topics WHERE unique_string_id = $1`;
        const fetchResult = await pool.query(fetchQuery, [topicId]);

        if (fetchResult.rowCount === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const notes = fetchResult.rows[0].notes;

        const updatedNotes = notes.map((note) =>
            note.text === oldNote.text ? newNote : note
        );

        const updateQuery = `
            UPDATE topics 
            SET notes = $1 
            WHERE unique_string_id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedNotes), topicId]);

        res.status(200).json(updateResult.rows);
    } catch (error) {
        console.error('Error updating note from topic:', error);
        res.status(500).json({ message: 'Error updating note from topic', error });
    };
};

export const starNoteFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { note } = req.body;

        const fetchQuery = `SELECT notes FROM topics WHERE unique_string_id = $1`;
        const fetchResult = await pool.query(fetchQuery, [topicId]);

        if (fetchResult.rowCount === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        };

        const notes = fetchResult.rows[0].notes;
        const updatedNotes = notes.map((n) =>
            n.text === note.text ? { ...n, starred: !n.starred } : n
        );
        const updateQuery = `
            UPDATE topics
            SET notes = $1
            WHERE unique_string_id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedNotes), topicId]);

        res.status(200).json(updateResult.rows);
    } catch (error) {
        console.error('Error starring note from topic:', error);
        res.status(500).json({ message: 'Error starring note from topic', error });
    };
};

export const deleteNoteFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { note } = req.body;

        const fetchQuery = `SELECT notes FROM topics WHERE unique_string_id = $1`;
        const fetchResult = await pool.query(fetchQuery, [topicId]);

        if (fetchResult.rowCount === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        };

        const notes = fetchResult.rows[0].notes;
        const updatedNotes = notes.filter(n => n.text !== note.text);
        const updateQuery = `
            UPDATE topics
            SET notes = $1
            WHERE unique_string_id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedNotes), topicId]);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ message: 'Topic or note not found' });
        };

        res.status(200).json(updateResult.rows);
    } catch (error) {
        console.error('Error deleting note from topic:', error);
        res.status(500).json({ message: 'Error deleting note from topic', error });
    };
};

// Term/Definition Controllers
export const addTermDefToTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { termdef } = req.body;

        const results = await pool.query(
            'UPDATE topics SET terms_defs = terms_defs || $1::text WHERE unique_string_id = $2 RETURNING *',
            [termdef, topicId]
        );

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding term/definition to topic:', error);
        res.status(500).json({ message: 'Error adding term/definition to topic', error });
    }
};

export const updateTermDefFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { termdef } = req.body;

        const query = `
            UPDATE topics 
            SET terms_defs = array_remove(terms_defs, $1) 
            WHERE unique_string_id = $2
            RETURNING *;
        `;

        const results = await pool.query(query, [termdef, topicId]);

        if (results.rowCount === 0) {
            return res.status(404).json({ message: 'Topic or term/definition not found' });
        }

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating term/definition from topic:', error);
        res.status(500).json({ message: 'Error updating term/definition from topic', error });
    }
};

export const deleteTermDefFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { termdef } = req.body;

        const query = `
            UPDATE topics
            SET terms_defs = array_remove(terms_defs, $1)
            WHERE unique_string_id = $2
            RETURNING *;
        `;

        const results = await pool.query(query, [termdef, topicId]);

        if (results.rowCount === 0) {
            return res.status(404).json({ message: 'Topic or term/definition not found' });
        }

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting term/definition from topic:', error);
        res.status(500).json({ message: 'Error deleting term/definition from topic', error });
    }
};

// Lesson Controllers
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
        // or maybe it still is for the lessons?

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

export const updateLessonFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { lesson } = req.body;

        const query = `
            UPDATE topics 
            SET lessons = (
                SELECT jsonb_agg(lesson) 
                FROM jsonb_array_elements(lessons) AS lesson 
                WHERE lesson->>'unique_string_id' = $1
            ) 
            WHERE unique_string_id = $2
            RETURNING *;
        `;

        const results = await pool.query(query, [lesson.unique_string_id, topicId]);

        if (results.rowCount === 0) {
            return res.status(404).json({ message: 'Topic or lesson not found' });
        }

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating lesson from topic:', error);
        res.status(500).json({ message: 'Error updating lesson from topic', error });
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