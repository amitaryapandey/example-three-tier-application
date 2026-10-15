import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentTasks } from '../../actions';

export default async function StudentTasks({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const data = await getStudentTasks(id);
  if (!data) notFound();

  const { student, tasks } = data;
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/teacher" className="text-sm text-zinc-500 hover:underline">
          ← All students
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-4 mb-2">
          {student.email}
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          {completed} / {tasks.length} completed
        </p>

        <ul className="space-y-2">
          {tasks.length === 0 && (
            <li className="text-zinc-400 text-center py-8">No tasks yet.</li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <span
                aria-label={task.completed ? 'Completed' : 'Not completed'}
                className={`h-5 w-5 rounded border-2 flex-shrink-0 ${
                  task.completed
                    ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
              />
              <span
                className={`flex-1 text-sm ${
                  task.completed
                    ? 'line-through text-zinc-400'
                    : 'text-zinc-800 dark:text-zinc-100'
                }`}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
