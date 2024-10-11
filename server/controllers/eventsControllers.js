import { pool } from '../config/database.js';

export const getEvents = async (req, res) => {
    try {
        const results = await pool.query('SELECT * FROM events');
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

export const createEvent = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            host_name,
            host_email,
            host_phone,
            host_password,
            host_title,
            event_name,
            event_organization,
            event_subject,
            event_description,
            event_date_time,
            event_duration
        } = req.body;

        const hostResults = await client.query(
            'INSERT INTO hosts (host_name, host_email, host_phone, host_password, host_title) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [host_name, host_email, host_phone, host_password, host_title]
        );

        const hostId = hostResults.rows[0].host_id;

        const eventResults = await client.query(
            'INSERT INTO events (event_host_id, event_name, event_organization, event_subject, event_description, event_date_time, event_duration) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [hostId, event_name, event_organization, event_subject, event_description, event_date_time, event_duration]
        );

        await client.query('COMMIT');

        res.status(201).json({
            host: hostResults.rows[0],
            event: eventResults.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event', error });
    } finally {
        client.release();
    }
};
