import { pool } from '../config/database.js';

// export const getEvents = async (req, res) => {
//     try {
//         const now = new Date().toISOString();

//         await pool.query(`
//             DELETE FROM events 
//             WHERE event_date_time + (event_duration::INTERVAL) < $1
//         `, [now]);

//         const results = await pool.query(`
//             SELECT * FROM events 
//             WHERE event_date_time + (event_duration::INTERVAL) >= $1
//             ORDER BY event_date_time ASC
//         `, [now]);

//         res.status(200).json(results.rows);
//     } catch (error) {
//         console.error('Error fetching events:', error);
//         res.status(500).json({ message: 'Error fetching events', error });
//     };
// };

export const getEvents = async (req, res) => {
    try {
        const now = new Date().toISOString();

        const pastEvents = await pool.query(`
            SELECT event_id, event_host_id
            FROM events 
            WHERE event_date_time + (event_duration || ' minutes')::INTERVAL < $1
        `, [now]);

        const eventIds = pastEvents.rows.map(event => event.event_id);
        const hostIds = pastEvents.rows.map(event => event.event_host_id);

        if (eventIds.length > 0) {
            await pool.query(`
                DELETE FROM attendees
                WHERE event_id = ANY($1)
            `, [eventIds]);

            await pool.query(`
                DELETE FROM hosts
                WHERE host_id = ANY($1)
            `, [hostIds]);

            await pool.query(`
                DELETE FROM events
                WHERE event_id = ANY($1)
            `, [eventIds]);
        }

        await pool.query(`
            DELETE FROM hosts 
            WHERE host_id NOT IN (
                SELECT DISTINCT event_host_id FROM events
            )
        `);

        await pool.query(`
            DELETE FROM attendees 
            WHERE event_id NOT IN (
                SELECT event_id FROM events
            )
        `);

        const results = await pool.query(`
            SELECT * FROM events 
            WHERE event_date_time + (event_duration || ' minutes')::INTERVAL >= $1
            ORDER BY event_date_time ASC
        `, [now]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events', error });
    };
};

export const getEventHost = async (req, res) => {
    try {
        const { hostId } = req.params;
        const results = await pool.query('SELECT * FROM hosts WHERE host_id = $1', [hostId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    };
};

export const getEventAttendees = async (req, res) => {
    try {
        const { eventId } = req.params;
        const results = await pool.query('SELECT * FROM attendees WHERE event_id = $1', [eventId]);
        res.status(200).json(results.rows);
    } catch (error) {
        throw error;
    };
};

export const registerAttendee = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { eventId } = req.params;
        const { attendee_name, attendee_email, attendee_phone, attendee_password } = req.body;

        const results = await client.query(
            'INSERT INTO attendees (event_id, attendee_name, attendee_email, attendee_phone, attendee_password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [eventId, attendee_name, attendee_email, attendee_phone, attendee_password]
        );

        await client.query('COMMIT');

        res.status(201).json(results.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error registering attendee:', error);
        res.status(500).json({ message: 'Error registering attendee', error });
    } finally {
        client.release();
    };
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
    };
};

export const updateEvent = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { hostId, eventId } = req.params;
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
            'UPDATE hosts SET host_name = $1, host_email = $2, host_phone = $3, host_password = $4, host_title = $5 WHERE host_id = $6 RETURNING *',
            [host_name, host_email, host_phone, host_password, host_title, hostId]
        );

        const eventResults = await client.query(
            'UPDATE events SET event_name = $1, event_organization = $2, event_subject = $3, event_description = $4, event_date_time = $5, event_duration = $6::INTERVAL WHERE event_id = $7 RETURNING *',
            [event_name, event_organization, event_subject, event_description, event_date_time, event_duration, eventId]
        );

        await client.query('COMMIT');

        res.status(200).json({
            host: hostResults.rows[0],
            event: eventResults.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', error });
    } finally {
        client.release();
    };
};