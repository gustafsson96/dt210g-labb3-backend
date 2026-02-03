'use strict';

const Hapi = require('@hapi/hapi');
const { Pool } = require('pg');

// Import routes
const todoRoutes = require('./routes/todoRoutes');

/* Local Postgres connection pool
const pool = new Pool({
    user: 'juliagustafsson',
    host: 'localhost',
    database: 'todoDb',
    password: '',
    port: 5432
}); */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const init = async () => {

    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Content-Type'],
            }
        }
    });

    // Register routes
    server.route(todoRoutes(pool));

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();