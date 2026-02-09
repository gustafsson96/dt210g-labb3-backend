'use strict';

const { Pool } = require('pg');

// Local PostgreSQL connection pool
const pool = new Pool({
    user: 'juliagustafsson',
    host: 'localhost',
    database: 'blogDb', 
    password: '',
    port: 5432
});

// Init database
(async () => {
    try {
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // Create posts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                author TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('Tables "users" and "posts" have been created');
    } catch (err) {
        console.error('Error creating tables', err);
    }
})();