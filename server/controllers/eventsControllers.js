import { pool } from '../config/database.js';

export const getEvents = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM events');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};
