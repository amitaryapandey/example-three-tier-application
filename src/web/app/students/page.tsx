import Link from 'next/link';
import { getStudents } from '../actions';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Students
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Select a student to view their dashboard
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                    {student.name}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {student.student_id}
                  </p>
                </div>
                {student.gpa && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {student.gpa.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">GPA</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-1 text-sm">
                <p className="text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium">Major:</span> {student.major}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium">Year:</span> {student.year}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {student.email}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            ← Back to Tasks
          </Link>
        </div>
      </div>
    </div>
  );
}
