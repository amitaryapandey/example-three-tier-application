import Link from 'next/link';
import { getStudents, createStudent, deleteStudent } from '../actions';
import StudentForm from './StudentForm';
import StudentList from './StudentList';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 mb-4 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tasks
          </Link>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Student Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage student records and information
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Total Students
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {students.length}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Active
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {students.filter(s => s.status === 'active').length}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Inactive
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {students.filter(s => s.status === 'inactive').length}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Average GPA
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {students.filter(s => s.gpa !== null).length > 0
                ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / 
                   students.filter(s => s.gpa !== null).length).toFixed(2)
                : 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Student Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Add New Student
              </h2>
              <StudentForm action={createStudent} />
            </div>
          </div>

          {/* Student List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                All Students
              </h2>
              <StudentList students={students} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
