const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Parses a positive 32-bit integer route param. Returns null if invalid.
function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// GET /tasks — list all tasks
app.get('/tasks', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks ORDER BY created_at ASC');
  res.json(rows);
});

// POST /tasks — create a task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await db.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  );
  res.status(201).json(rows[0]);
});

// PATCH /tasks/:id — update a task (complete/uncomplete or rename)
app.patch('/tasks/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });
  const { completed, title } = req.body;

  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const current = rows[0];
  const newCompleted = completed !== undefined ? Boolean(completed) : current.completed;
  const newTitle = title !== undefined ? title.trim() : current.title;

  const { rows: updated } = await db.query(
    'UPDATE tasks SET completed = $1, title = $2 WHERE id = $3 RETURNING *',
    [newCompleted, newTitle, id]
  );
  res.json(updated[0]);
});

// GET /students — students with total and completed task counts
app.get('/students', async (_req, res) => {
  const { rows } = await db.query(`
    SELECT u.id, u.email,
           COUNT(t.id)::int AS total,
           (COUNT(t.id) FILTER (WHERE t.completed))::int AS completed
    FROM users u
    LEFT JOIN tasks t ON t.user_id = u.id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.email ASC
  `);
  res.json(rows);
});

// GET /students/:id/tasks — one student's tasks
app.get('/students/:id/tasks', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id' });

  const { rows: students } = await db.query(
    "SELECT id, email FROM users WHERE id = $1 AND role = 'student'",
    [id]
  );
  if (students.length === 0) return res.status(404).json({ error: 'Not found' });

  const { rows: tasks } = await db.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC',
    [id]
  );
  res.json({ student: students[0], tasks });
});

// GET /dashboard/summary — completion totals across all students' tasks
app.get('/dashboard/summary', async (_req, res) => {
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE role = 'student') AS students,
      COUNT(t.id)::int AS total_tasks,
      (COUNT(t.id) FILTER (WHERE t.completed))::int AS completed_tasks
    FROM tasks t
    WHERE t.user_id IS NOT NULL
  `);
  res.json(rows[0]);
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
