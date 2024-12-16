import { pool } from '../config/database.js';
import { nanoid } from 'nanoid';

export const getAllIndexes = async () => {
    try {
        const tableNamesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        const tableNames = tableNamesResult.rows.map(row => row.table_name);
        const allIndexes = new Set();

        for (const tableName of tableNames) {
            let indexColumn = '';
            if (tableName === 'units') {
                indexColumn = 'unit_index';
            } else if (tableName === 'classes') {
                indexColumn = 'class_index';
            } else if (tableName === 'topics') {
                indexColumn = 'topic_index';
            }

            const tableDataResult = await pool.query(`SELECT ${indexColumn} FROM ${tableName}`);
            tableDataResult.rows.forEach(row => {
                console.log('row:', row[indexColumn]);
                allIndexes.add(row[indexColumn]);
            });
        };

        console.log('allIndexes:', allIndexes);

        return Array.from(allIndexes);
    } catch (error) {
        console.error('Error fetching all indexes:', error);
        throw error;
    }
};

export const generateUniqueStringId = () => {
    return nanoid();
};

export const getAllUniqueIds = async () => {
    try {
        const tableNamesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        const tableNames = tableNamesResult.rows.map(row => row.table_name);
        const allUniqueIds = new Set();

        for (const tableName of tableNames) {
            const tableDataResult = await pool.query(`SELECT unique_string_id FROM ${tableName}`);
            if (!tableDataResult.rows) {
                continue;
            };
            tableDataResult.rows.forEach(row => {
                allUniqueIds.add(row.unique_string_id);
            });
        }

        return Array.from(allUniqueIds);
    } catch (error) {
        console.error('Error fetching all unique IDs:', error);
        throw error;
    }
};