module.exports = (pool) => [
    // GET all posts
    {
        method: 'GET',
        path: '/posts',
        options: { auth: false },
        handler: async (request, h) => {
            try {
                const res = await pool.query(
                    'SELECT * FROM posts ORDER BY created_at DESC'
                );
                return h.response(res.rows).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to fetch posts.' }).code(500);
            }
        }
    },
    // GET single post
    {
        method: 'GET',
        path: '/posts/{id}',
        options: { auth: false },
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const res = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
                if (res.rowCount === 0) {
                    return h.response({ error: 'Post not found.' }).code(404);
                }
                return h.response(res.rows[0]).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to fetch post.' }).code(500);
            }
        }
    },

    // POST to create new post
    {
        method: 'POST',
        path: '/posts',
        options: { auth: 'jwt' },
        handler: async (request, h) => {
            const { title, content, author } = request.payload;

            try {
                const res = await pool.query(
                    `INSERT INTO posts (title, content, author) 
                     VALUES ($1, $2, $3) 
                     RETURNING *`,
                    [title, content, author]
                );
                return h.response(res.rows[0]).code(201);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to create post.' }).code(500);
            }
        }
    },

    // PUT to update existing post
    {
        method: 'PUT',
        path: '/posts/{id}',
        options: { auth: 'jwt' },
        handler: async (request, h) => {
            const { id } = request.params;
            const { title, content, author } = request.payload;

            try {
                const res = await pool.query(
                    `UPDATE posts
                     SET title = $1,
                         content = $2,
                         author = $3,
                         updated_at = NOW()
                     WHERE id = $4
                     RETURNING *`,
                    [title, content, author, id]
                );

                if (res.rowCount === 0) {
                    return h.response({ error: 'Post not found.' }).code(404);
                }

                return h.response(res.rows[0]).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to update post.' }).code(500);
            }
        }
    },

    // DELETE post
    {
        method: 'DELETE',
        path: '/posts/{id}',
        options: { auth: 'jwt' },
        handler: async (request, h) => {
            const { id } = request.params;

            try {
                const res = await pool.query(
                    `DELETE FROM posts WHERE id = $1 RETURNING *`,
                    [id]
                );

                if (res.rowCount === 0) {
                    return h.response({ error: 'Post not found.' }).code(404);
                }

                return h.response(res.rows[0]).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to delete post.' }).code(500);
            }
        }
    }
];