module.exports = (pool) => [
    // GET
    {
        method: 'GET',
        path: '/todos',
        handler: async (request, h) => {
            try {
                let query = 'SELECT * FROM todos ORDER BY id ASC';

                const res = await pool.query(query);
                return h.response(res.rows).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to fetch todos.' }).code(500);
            }
        }
    },
    // POST
    {
        method: 'POST',
        path: '/todos',
        handler: async (request, h) => {
            const { title, description, status } = request.payload;

            try {
                const result = await pool.query(
                    `INSERT INTO todos (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
                    [title, description, status]
                );

                return h.response(result.rows[0]).code(201);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to create todo' }).code(500);
            }
        }
    },
    // PUT
    {
        method: 'PUT',
        path: '/todos/{id}',
        handler: async (request, h) => {
            const { id } = request.params;
            const { title, description, status } = request.payload;

            try {
                const result = await pool.query(
                    `UPDATE todos
                    SET title = $1,
                    description = $2, 
                    status = $3
                    WHERE id = $4
                    RETURNING *`,
                    [title, description, status, id]
                );
                if (result.rowCount === 0) {
                    return h.response({ error: 'Todo not found.' }).code(404);
                }

                return h.response(result.rows[0]).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to update todo.' }).code(500);
            }
        }
    },
    //DELETE
    {
        method: 'DELETE',
        path: '/todos/{id}',
        handler: async (request, h) => {
            const { id } = request.params;

            try {
                const result = await pool.query(
                    `DELETE FROM todos WHERE id = $1 RETURNING *`,
                    [id]
                );

                if (result.rowCount === 0) {
                    return h.response({ error: 'Todo not found. ' }).code(404);
                }

                return h.response(result.rows[0]).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to delete todo. ' }).code(500);
            }
        }
    }
]