'use strict';

const { Pool } = require('pg');

/* Create a local PostgreSQL connection pool
const pool = new Pool({
    user: 'juliagustafsson',
    host: 'localhost',
    database: 'todoDb',
    password: '',
    port: 5432
}); */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        // Create todos table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description VARCHAR(500) NOT NULL,
                status VARCHAR(20) NOT NULL
                 CHECK (status IN ('ej påbörjad', 'pågående', 'avklarad'))
            )
        `);
        console.log('Table "todos" has been created');
    } catch (err) {
        console.error('Error creating tables', err);
    }
})();