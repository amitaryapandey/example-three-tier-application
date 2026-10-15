const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

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
  const id = parseInt(req.params.id, 10);
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

// ===== STUDENT ENDPOINTS =====

// GET /students — list all students
app.get('/students', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM students';
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /students/:id — get a single student
app.get('/students/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST /students — create a new student
app.post('/students', async (req, res) => {
  try {
    const { name, email, grade, enrollment_date, status, gpa } = req.body;
    
    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'email is required' });
    }
    if (!grade || typeof grade !== 'string' || !grade.trim()) {
      return res.status(400).json({ error: 'grade is required' });
    }
    
    const { rows } = await db.query(
      `INSERT INTO students (name, email, grade, enrollment_date, status, gpa) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        name.trim(),
        email.trim(),
        grade.trim(),
        enrollment_date || null,
        status || 'active',
        gpa || null
      ]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PATCH /students/:id — update a student
app.patch('/students/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, grade, enrollment_date, status, gpa } = req.body;
    
    const { rows } = await db.query('SELECT * FROM students WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const current = rows[0];
    const updates = {
      name: name !== undefined ? name.trim() : current.name,
      email: email !== undefined ? email.trim() : current.email,
      grade: grade !== undefined ? grade.trim() : current.grade,
      enrollment_date: enrollment_date !== undefined ? enrollment_date : current.enrollment_date,
      status: status !== undefined ? status : current.status,
      gpa: gpa !== undefined ? gpa : current.gpa,
    };
    
    const { rows: updated } = await db.query(
      `UPDATE students 
       SET name = $1, email = $2, grade = $3, enrollment_date = $4, status = $5, gpa = $6, updated_at = now()
       WHERE id = $7 
       RETURNING *`,
      [updates.name, updates.email, updates.grade, updates.enrollment_date, updates.status, updates.gpa, id]
    );
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /students/:id — delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await db.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully', student: rows[0] });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
