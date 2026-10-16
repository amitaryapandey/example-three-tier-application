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
app.get('/students', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM students ORDER BY name ASC');
  res.json(rows);
});

// GET /students/:id — get a single student with details
app.get('/students/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { rows } = await db.query('SELECT * FROM students WHERE id = $1', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
  res.json(rows[0]);
});

// GET /students/:id/dashboard — get student dashboard data
app.get('/students/:id/dashboard', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  try {
    // Get student info
    const studentResult = await db.query('SELECT * FROM students WHERE id = $1', [id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentResult.rows[0];

    // Get enrolled courses with grades
    const coursesResult = await db.query(`
      SELECT c.*, e.grade, e.status, e.enrolled_at
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY c.semester DESC, c.code ASC
    `, [id]);

    // Get assignments for enrolled courses
    const assignmentsResult = await db.query(`
      SELECT 
        a.*,
        c.code as course_code,
        c.name as course_name,
        s.points_earned,
        s.submitted_at,
        s.status as submission_status
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = $1
      WHERE e.student_id = $1
      ORDER BY a.due_date ASC
    `, [id]);

    // Calculate statistics
    const totalAssignments = assignmentsResult.rows.length;
    const submittedAssignments = assignmentsResult.rows.filter(a => a.submission_status).length;
    const gradedAssignments = assignmentsResult.rows.filter(a => a.submission_status === 'graded').length;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    assignmentsResult.rows.forEach(a => {
      if (a.submission_status === 'graded' && a.points_earned !== null) {
        totalPoints += a.max_points;
        earnedPoints += a.points_earned;
      }
    });
    
    const averageScore = totalPoints > 0 ? ((earnedPoints / totalPoints) * 100).toFixed(1) : null;

    // Get upcoming assignments (not submitted and due in the future)
    const now = new Date();
    const upcomingAssignments = assignmentsResult.rows
      .filter(a => !a.submission_status && new Date(a.due_date) > now)
      .slice(0, 5);

    res.json({
      student,
      courses: coursesResult.rows,
      assignments: assignmentsResult.rows,
      statistics: {
        totalCourses: coursesResult.rows.length,
        totalAssignments,
        submittedAssignments,
        gradedAssignments,
        averageScore,
      },
      upcomingAssignments,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /courses — list all courses
app.get('/courses', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM courses ORDER BY code ASC');
  res.json(rows);
});

// GET /assignments — list all assignments
app.get('/assignments', async (_req, res) => {
  const { rows } = await db.query(`
    SELECT a.*, c.code as course_code, c.name as course_name
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    ORDER BY a.due_date ASC
  `);
  res.json(rows);
});

// POST /submissions — submit an assignment
app.post('/submissions', async (req, res) => {
  const { assignment_id, student_id } = req.body;
  
  if (!assignment_id || !student_id) {
    return res.status(400).json({ error: 'assignment_id and student_id are required' });
  }

  try {
    // Check if already submitted
    const existing = await db.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignment_id, student_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Assignment already submitted' });
    }

    const { rows } = await db.query(
      'INSERT INTO submissions (assignment_id, student_id, status) VALUES ($1, $2, $3) RETURNING *',
      [assignment_id, student_id, 'submitted']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
