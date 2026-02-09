'use strict';

const Hapi = require('@hapi/hapi');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes'); 

// Local Postgres connection pool
const pool = new Pool({
    user: 'juliagustafsson',
    host: 'localhost',
    database: 'blogdb',
    password: '',       
    port: 5432
});

const init = async () => {

    const server = Hapi.server({
        port: 3000, 
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Content-Type'],
            }
        }
    });

    // Register routes
    server.route(postRoutes(pool));

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();