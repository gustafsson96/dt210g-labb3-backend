'use strict';

require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Pool } = require('pg');

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const JWT_SECRET = process.env.JWT_SECRET;

/* Local Postgres connection pool
const pool = new Pool({
    user: 'juliagustafsson',
    host: 'localhost',
    database: 'blogdb',
    password: '',       
    port: 5432
});
*/

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const init = async () => {

    const server = Hapi.server({
        port: 3000, 
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Content-Type', 'Authorization'],
                additionalExposedHeaders: ['Authorization']
            }
        }
    });

    await server.register(Jwt);

      server.auth.strategy('jwt', 'jwt', {
    keys: JWT_SECRET,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600
    },
    validate: async (artifacts, request, h) => {
      return {
        isValid: true,
        credentials: artifacts.decoded.payload
      };
    }
  });

  server.auth.default('jwt');

    // Register routes
    server.route(postRoutes(pool));
    server.route(authRoutes(pool, JWT_SECRET));

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();