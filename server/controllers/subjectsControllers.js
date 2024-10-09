import { query, json } from 'express';
import { pool } from '../config/database.js';
// import subjectData from '../data/subjects.js';

export const getSubjects = async (req, res) => {
    // res.json(subjectData);

    try {
        const results = await pool.query('SELECT * FROM subjects');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

export const getSubjectsById = async (req, res) => {
    // const subject = subjectData.find(subject => subject.id === req.params.subjectId);
    // res.json(subject);

    try {
        const results = await pool.query('SELECT * FROM subjects WHERE unique_string_id = $1', [req.params.subjectId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};