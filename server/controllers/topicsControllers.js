import { pool } from '../config/database.js';

export const getTopics = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM topics');
        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Error fetching topics', error });
    };
};

export const getTopicsByUnitId = async (req, res) => {
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
        const { unitId } = req.params;
        const { subjectId, classId, name, description, topic_index } = req.body;

        const results = await pool.query(
            'INSERT INTO topics (subjectid, classid, unitid, name, description, topic_index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [subjectId, classId, unitId, name, description, topic_index]
        );

        await pool.query('UPDATE units SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [unitId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error adding topic:', error);
        res.status(500).json({ message: 'Error adding topic', error });
    };
};

export const deleteTopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        const results = await pool.query('DELETE FROM topics WHERE unique_string_id = $1 RETURNING *', [topicId]);

        if (results.rowCount === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const unitId = results.rows[0].unitid;

        await pool.query('UPDATE units SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [unitId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Error deleting topic', error });
    };
};

/* Sub-Topic Controllers */

// Note Controllers
export const addNoteToTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { note } = req.body;

        const results = await pool.query(
            'UPDATE topics SET notes = COALESCE(notes, \'[]\'::jsonb) || $1::jsonb WHERE unique_string_id = $2 RETURNING *',
            [JSON.stringify(note), topicId]
        );

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

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
            note.unique_string_id === oldNote.unique_string_id ? newNote : note
        );

        const updateQuery = `
            UPDATE topics 
            SET notes = $1 
            WHERE unique_string_id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedNotes), topicId]);

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

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
            n.unique_string_id === note.unique_string_id ? { ...n, starred: !n.starred } : n
        );
        const updateQuery = `
            UPDATE topics
            SET notes = $1
            WHERE unique_string_id = $2
            RETURNING *;
        `;
        const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedNotes), topicId]);

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

        res.status(200).json(updateResult.rows);
    } catch (error) {
        console.error('Error starring note from topic:', error);
        res.status(500).json({ message: 'Error starring note from topic', error });
    };
};

export const deleteNoteFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { dataInfo } = req.body;

        const fetchQuery = `SELECT notes FROM topics WHERE unique_string_id = $1`;
        const fetchResult = await pool.query(fetchQuery, [topicId]);

        if (fetchResult.rowCount === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        };

        const notes = fetchResult.rows[0].notes;
        const updatedNotes = notes.filter(n => n.unique_string_id !== dataInfo.unique_string_id);
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

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

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
            'UPDATE topics SET terms_defs = COALESCE(terms_defs, \'[]\'::jsonb) || $1::jsonb WHERE unique_string_id = $2 RETURNING *',
            [termdef, topicId]
        );

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding term/definition to topic:', error);
        res.status(500).json({ message: 'Error adding term/definition to topic', error });
    };
};

export const updateTermDefFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { termdef } = req.body;
        let isExistingEdit = false;

        if (termdef.originaldef) isExistingEdit = true;

        const terms_defs = await pool.query('SELECT terms_defs FROM topics WHERE unique_string_id = $1', [topicId]);
        const terms_defsResults = terms_defs.rows[0].terms_defs;
        const termToUpdate = terms_defsResults.find(item => item.unique_string_id === termdef.termid);

        if (!termToUpdate) {
            return res.status(404).json({ message: 'Term not found' });
        };

        let updatedTerm;
        let updatedTermsDefs;

        if (isExistingEdit) {
            const updatedDefinitions = termToUpdate.definition.map(def =>
                def === termdef.originaldef ? termdef.definition : def
            );

            updatedTerm = {
                ...termToUpdate,
                definition: updatedDefinitions
            };

            updatedTermsDefs = terms_defsResults.map(item =>
                item.unique_string_id === termdef.termid ? updatedTerm : item
            );
        } else {
            updatedTerm = {
                ...termToUpdate,
                definition: [...termToUpdate.definition, ...termdef.definition]
            };

            updatedTermsDefs = terms_defsResults.map(item =>
                item.unique_string_id === termdef.termid ? updatedTerm : item
            );
        };
        
        const results = await pool.query(
            'UPDATE topics SET terms_defs = $1 WHERE unique_string_id = $2 RETURNING *',
            [JSON.stringify(updatedTermsDefs), topicId]
        );

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error updating term/definition from topic:', error);
        res.status(500).json({ message: 'Error updating term/definition from topic', error });
    };
};

export const deleteTermDefFromTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const { dataInfo } = req.body;
        
        let results;
        const terms_defs = await pool.query('SELECT terms_defs FROM topics WHERE unique_string_id = $1', [topicId]);
        const terms_defsResults = terms_defs.rows[0].terms_defs;
        const termToEdit = terms_defsResults.find(item => item.unique_string_id === dataInfo.termid);

        if (!termToEdit) {
            return res.status(404).json({ message: 'Term not found' });
        };

        if (dataInfo.definition) {
            let updatedDefinitions = [];

            termToEdit.definition.forEach(def => {
                if (def !== dataInfo.definition) {
                    updatedDefinitions.push(def);
                }
            });

            const updatedTerm = {
                ...termToEdit,
                definition: updatedDefinitions
            };

            const updatedTermsDefs = terms_defsResults.map(item =>
                item.unique_string_id === dataInfo.termid ? updatedTerm : item
            );

            results = await pool.query(
                'UPDATE topics SET terms_defs = $1 WHERE unique_string_id = $2 RETURNING *',
                [JSON.stringify(updatedTermsDefs), topicId]
            );
        } else if (!dataInfo.definition) {
            const updatedTermsDefs = terms_defsResults.filter(item => item.unique_string_id !== dataInfo.termid);

            results = await pool.query(
                'UPDATE topics SET terms_defs = $1 WHERE unique_string_id = $2 RETURNING *',
                [JSON.stringify(updatedTermsDefs), topicId]
            );
        };

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting term/definition from topic:', error);
        res.status(500).json({ message: 'Error deleting term/definition from topic', error });
    };
};

// Lesson Controllers
export const addLessonToTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const lesson = { ...req.body };

        const results = await pool.query(
            'UPDATE topics SET lessons = COALESCE(lessons, \'[]\'::jsonb) || $1::jsonb WHERE unique_string_id = $2 RETURNING *',
            [JSON.stringify(lesson), topicId]
        );

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

        res.status(201).json(results.rows);
    } catch (error) {
        console.error('Error adding lesson to topic:', error);
        res.status(500).json({ message: 'Error adding lesson to topic', error });
    };
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

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

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

        await pool.query('UPDATE topics SET date_updated = NOW() WHERE unique_string_id = $1 RETURNING *', [topicId]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error deleting lesson from topic:', error);
        res.status(500).json({ message: 'Error deleting lesson from topic', error });
    }
};