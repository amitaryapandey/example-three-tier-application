exports.up = (pgm) => {
  pgm.addColumn('users', {
    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'student',
      check: "role IN ('student', 'teacher')",
    },
  });

  // Nullable so existing tasks (created before ownership existed) stay valid.
  pgm.addColumn('tasks', {
    user_id: {
      type: 'integer',
      notNull: false,
      references: 'users',
      onDelete: 'SET NULL',
    },
  });
  pgm.createIndex('tasks', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('tasks', 'user_id');
  pgm.dropColumn('tasks', 'user_id');
  pgm.dropColumn('users', 'role');
};
