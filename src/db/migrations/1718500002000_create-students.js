exports.up = (pgm) => {
  // Create students table
  pgm.createTable('students', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    student_id: { type: 'varchar(50)', notNull: true, unique: true },
    major: { type: 'varchar(100)', notNull: true },
    year: { type: 'integer', notNull: true },
    gpa: { type: 'decimal(3,2)', notNull: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create courses table
  pgm.createTable('courses', {
    id: { type: 'serial', primaryKey: true },
    code: { type: 'varchar(20)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    credits: { type: 'integer', notNull: true },
    instructor: { type: 'varchar(255)', notNull: true },
    semester: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create enrollments table (many-to-many relationship)
  pgm.createTable('enrollments', {
    id: { type: 'serial', primaryKey: true },
    student_id: { type: 'integer', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    grade: { type: 'varchar(2)', notNull: false },
    status: { type: 'varchar(20)', notNull: true, default: 'enrolled' }, // enrolled, completed, dropped
    enrolled_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create assignments table
  pgm.createTable('assignments', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text', notNull: false },
    due_date: { type: 'timestamp', notNull: true },
    max_points: { type: 'integer', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  // Create submissions table
  pgm.createTable('submissions', {
    id: { type: 'serial', primaryKey: true },
    assignment_id: { type: 'integer', notNull: true, references: 'assignments(id)', onDelete: 'CASCADE' },
    student_id: { type: 'integer', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    points_earned: { type: 'integer', notNull: false },
    submitted_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    status: { type: 'varchar(20)', notNull: true, default: 'submitted' }, // submitted, graded, late
  });

  // Add unique constraint for enrollment
  pgm.addConstraint('enrollments', 'unique_student_course', {
    unique: ['student_id', 'course_id']
  });

  // Add unique constraint for submission
  pgm.addConstraint('submissions', 'unique_student_assignment', {
    unique: ['student_id', 'assignment_id']
  });

  // Insert sample data
  pgm.sql(`
    INSERT INTO students (name, email, student_id, major, year, gpa) VALUES
    ('Alice Johnson', 'alice.johnson@university.edu', 'STU001', 'Computer Science', 3, 3.85),
    ('Bob Smith', 'bob.smith@university.edu', 'STU002', 'Mathematics', 2, 3.60),
    ('Carol Davis', 'carol.davis@university.edu', 'STU003', 'Computer Science', 4, 3.92);
  `);

  pgm.sql(`
    INSERT INTO courses (code, name, credits, instructor, semester) VALUES
    ('CS101', 'Introduction to Programming', 3, 'Dr. Sarah Williams', 'Fall 2024'),
    ('CS201', 'Data Structures', 4, 'Dr. Michael Chen', 'Fall 2024'),
    ('CS301', 'Algorithms', 4, 'Dr. Emily Brown', 'Fall 2024'),
    ('MATH201', 'Calculus II', 4, 'Dr. Robert Taylor', 'Fall 2024');
  `);

  pgm.sql(`
    INSERT INTO enrollments (student_id, course_id, grade, status) VALUES
    (1, 2, 'A', 'enrolled'),
    (1, 3, 'A-', 'enrolled'),
    (2, 1, 'B+', 'enrolled'),
    (2, 4, 'A', 'enrolled'),
    (3, 2, 'A', 'enrolled'),
    (3, 3, 'A', 'enrolled');
  `);

  pgm.sql(`
    INSERT INTO assignments (course_id, title, description, due_date, max_points) VALUES
    (2, 'Binary Search Tree Implementation', 'Implement a balanced BST with insert, delete, and search operations', '2024-12-15 23:59:00', 100),
    (2, 'Hash Table Project', 'Create a hash table with collision handling', '2024-12-20 23:59:00', 100),
    (3, 'Sorting Algorithms Analysis', 'Compare time complexity of various sorting algorithms', '2024-12-18 23:59:00', 100),
    (3, 'Dynamic Programming Problems', 'Solve 5 DP problems with explanations', '2024-12-22 23:59:00', 100);
  `);

  pgm.sql(`
    INSERT INTO submissions (assignment_id, student_id, points_earned, status) VALUES
    (1, 1, 95, 'graded'),
    (2, 1, NULL, 'submitted'),
    (3, 1, 88, 'graded'),
    (1, 3, 98, 'graded'),
    (3, 3, 92, 'graded');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('submissions');
  pgm.dropTable('assignments');
  pgm.dropTable('enrollments');
  pgm.dropTable('courses');
  pgm.dropTable('students');
};
