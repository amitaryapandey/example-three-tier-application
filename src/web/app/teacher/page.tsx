import Link from 'next/link';
import { getDashboardSummary, getStudents } from '../actions';

export default async function TeacherDashboard() {
  const [students, summary] = await Promise.all([getStudents(), getDashboardSummary()]);
  const rate =
    summary.total_tasks === 0
      ? 0
      : Math.round((summary.completed_tasks / summary.total_tasks) * 100);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          Teacher Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
            <p className="text-xs text-zinc-400">Students</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{summary.students}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
            <p className="text-xs text-zinc-400">Tasks completed</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {summary.completed_tasks} / {summary.total_tasks}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
            <p className="text-xs text-zinc-400">Completion rate</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{rate}%</p>
          </div>
        </div>

        <table className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
          <thead className="bg-zinc-100 dark:bg-zinc-700 text-left text-zinc-600 dark:text-zinc-200">
            <tr>
              <th className="px-4 py-2 font-medium">Student</th>
              <th className="px-4 py-2 font-medium text-right">Completed</th>
              <th className="px-4 py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-400">
                  No students yet.
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="border-t border-zinc-200 dark:border-zinc-700">
                <td className="px-4 py-2">
                  <Link
                    href={`/teacher/${s.id}`}
                    className="text-zinc-900 dark:text-zinc-50 underline underline-offset-2"
                  >
                    {s.email}
                  </Link>
                </td>
                <td className="px-4 py-2 text-right">{s.completed}</td>
                <td className="px-4 py-2 text-right">{s.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
