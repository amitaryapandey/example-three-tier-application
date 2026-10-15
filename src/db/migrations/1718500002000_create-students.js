exports.up = (pgm) => {
  pgm.createTable('students', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    grade: { type: 'varchar(50)', notNull: true },
    enrollment_date: { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
    status: { type: 'varchar(50)', notNull: true, default: 'active' },
    gpa: { type: 'decimal(3,2)', notNull: false },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('students', 'email');
  pgm.createIndex('students', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('students');
};
