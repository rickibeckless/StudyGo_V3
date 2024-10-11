import { pool } from './database.js';
import './dotenv.js';

const executeQuery = async (query, successMessage) => {
    try {
        await pool.query(query);
        console.log(successMessage);
    } catch (err) {
        console.error(`Error executing query: ${err.message}`);
    }
};

const createTables = async () => {
    const hostsTable = `CREATE TABLE IF NOT EXISTS hosts (
        host_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        host_name VARCHAR(50) NOT NULL,
        host_title VARCHAR(50) NOT NULL,
        host_email VARCHAR(50) UNIQUE NOT NULL,
        host_phone VARCHAR(50) NOT NULL,
        host_password VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    )`;

    const eventsTable = `CREATE TABLE IF NOT EXISTS events (
        event_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        event_host_id uuid REFERENCES hosts(host_id) ON DELETE CASCADE NOT NULL,
        event_organization VARCHAR(50),
        event_subject VARCHAR(50) NOT NULL,
        event_name VARCHAR(50) NOT NULL,
        event_description TEXT NOT NULL,
        event_date_time TIMESTAMPTZ NOT NULL,
        event_duration INTERVAL DEFAULT '1 hour',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    )`;

    const attendeesTable = `CREATE TABLE IF NOT EXISTS attendees (
        attendee_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        event_id uuid REFERENCES events(event_id) ON DELETE CASCADE NOT NULL,
        attendee_name VARCHAR(50) NOT NULL,
        attendee_email VARCHAR(50) UNIQUE NOT NULL,
        attendee_phone VARCHAR(50) NOT NULL,
        attendee_password VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    )`;

    await executeQuery(hostsTable, 'Hosts table created successfully');
    await executeQuery(eventsTable, 'Events table created successfully');
    await executeQuery(attendeesTable, 'Attendees table created successfully');
};

const resetTables = async () => {
    const dropEventsTable = 'DROP TABLE IF EXISTS events CASCADE';
    const dropHostsTable = 'DROP TABLE IF EXISTS hosts CASCADE';
    const dropAttendeesTable = 'DROP TABLE IF EXISTS attendees CASCADE';

    await executeQuery(dropEventsTable, 'Events table dropped successfully');
    await executeQuery(dropHostsTable, 'Hosts table dropped successfully');
    await executeQuery(dropAttendeesTable, 'Attendees table dropped successfully');
};

const seedTables = async () => {
    try {
        // Seed hosts
        const seedHosts = `
            INSERT INTO hosts (host_name, host_title, host_email, host_phone, host_password) VALUES
            ('John Doe', 'Event Manager', 'johndoe@example.com', '123-456-7890', 'password'),
            ('Jane Smith', 'Event Coordinator', 'janesmith@example.com', '987-654-3210', 'password'),
            ('Michael Johnson', 'Organizer', 'mjohnson@example.com', '555-666-7777', 'password')
            RETURNING host_id;
        `;

        const { rows: hosts } = await pool.query(seedHosts);
        console.log('Hosts seeded successfully:', hosts);

        // Seed events (using host IDs from seeded hosts)
        const seedEvents = `
            INSERT INTO events (event_host_id, event_organization, event_subject, event_name, event_description, event_date_time, event_duration) VALUES
            ('${hosts[0].host_id}', 'Tech Corp', 'Technology', 'Tech Conference 2024', 'An annual tech conference.', '2024-12-01 10:00:00', '3 hours'),
            ('${hosts[1].host_id}', 'Marketing Pro', 'Marketing', 'Marketing Summit 2024', 'A summit for marketing professionals.', '2024-11-10 09:00:00', '4 hours'),
            ('${hosts[2].host_id}', 'Health Innovators', 'Healthcare', 'Health Expo 2024', 'A conference about the latest healthcare innovations.', '2024-10-15 08:00:00', '5 hours')
            RETURNING event_id;
        `;

        const { rows: events } = await pool.query(seedEvents);
        console.log('Events seeded successfully:', events);

        // Seed attendees (using event IDs from seeded events)
        const seedAttendees = `
            INSERT INTO attendees (event_id, attendee_name, attendee_email, attendee_phone, attendee_password) VALUES
            ('${events[0].event_id}', 'Alice Cooper', 'alice.cooper@example.com', '111-222-3333', 'password'),
            ('${events[0].event_id}', 'Bob Marley', 'bob.marley@example.com', '222-333-4444', 'password'),
            ('${events[1].event_id}', 'Charlie Brown', 'charlie.brown@example.com', '333-444-5555', 'password'),
            ('${events[2].event_id}', 'David Bowie', 'david.bowie@example.com', '444-555-6666', 'password'),
            ('${events[2].event_id}', 'Eve Adams', 'eve.adams@example.com', '555-666-7777', 'password')
        `;

        await pool.query(seedAttendees);
        console.log('Attendees seeded successfully');
    } catch (error) {
        console.error('Error seeding tables:', error.message);
    };
};

const reset = async () => {
    await resetTables();
    await createTables();
    await seedTables();
};

//reset();