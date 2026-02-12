'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (pool) => [
    // Register new user
    {
        method: 'POST',
        path: '/auth/register',
        options: { auth: false },
        handler: async (request, h) => {
            const { username, password } = request.payload;

            try {
                // Check if user exists
                const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
                if (existing.rowCount > 0) {
                    return h.response({ error: 'Username already exists.' }).code(400);
                }

                // Hash password with bcrypt
                const hashed = await bcrypt.hash(password, 10);

                // Create user
                const res = await pool.query(
                    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
                    [username, hashed]
                );

                return h.response(res.rows[0]).code(201);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to register user.' }).code(500);
            }
        }
    },

    // Login route
    {
        method: 'POST',
        path: '/auth/login',
        options: { auth: false },
        handler: async (request, h) => {
            const { username, password } = request.payload;

            try {
                const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
                if (res.rowCount === 0) {
                    return h.response({ error: 'Invalid username or password.' }).code(401);
                }

                const user = res.rows[0];

                // Compare passwords
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return h.response({ error: 'Invalid username or password.' }).code(401);
                }

                // Create jwt
                const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

                return h.response({ token }).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to login.' }).code(500);
            }
        }
    },

    // Get logged in user
    {
        method: 'GET',
        path: '/auth/user',
        options: {
            auth: false
        },
        handler: async (request, h) => {
            const authHeader = request.headers.authorization;
            if (!authHeader) return h.response({ error: 'Missing authorization header.' }).code(401);

            const token = authHeader.replace('Bearer ', '');
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                return h.response({ id: decoded.id, username: decoded.username }).code(200);
            } catch (err) {
                return h.response({ error: 'Invalid token.' }).code(401);
            }
        }
    }
];