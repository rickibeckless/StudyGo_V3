import { query } from 'express';
import { pool } from '../config/database.js';
import { nanoid } from 'nanoid';

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