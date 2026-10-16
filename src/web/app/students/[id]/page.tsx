import Link from 'next/link';
import { getStudentDashboard, submitAssignment } from '../../actions';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentDashboardPage({ params }: PageProps) {
  const { id } = await params;
  const studentId = parseInt(id, 10);

  if (isNaN(studentId)) {
    notFound();
  }

  let data;
  try {
    data = await getStudentDashboard(studentId);
  } catch (error) {
    notFound();
  }

  const { student, courses, assignments, statistics, upcomingAssignments } = data;

  // Separate assignments by status
  const pendingAssignments = assignments.filter(a => !a.submission_status);
  const submittedAssignments = assignments.filter(a => a.submission_status === 'submitted');
  const gradedAssignments = assignments.filter(a => a.submission_status === 'graded');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/students"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors mb-4 inline-block"
          >
            ← Back to Students
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {student.name}
              </h1>
              <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <span>{student.student_id}</span>
                <span>•</span>
                <span>{student.major}</span>
                <span>•</span>
                <span>Year {student.year}</span>
              </div>
            </div>
            {student.gpa && (
              <div className="text-right">
                <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
                  {student.gpa.toFixed(2)}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">GPA</div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {statistics.totalCourses}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Enrolled Courses</div>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {statistics.submittedAssignments}/{statistics.totalAssignments}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Submitted</div>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {statistics.gradedAssignments}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Graded</div>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              {statistics.averageScore ? `${statistics.averageScore}%` : 'N/A'}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Average Score</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Assignments */}
            {upcomingAssignments.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  Upcoming Assignments
                </h2>
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {assignment.course_code} - {assignment.course_name}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {assignment.max_points} pts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <form
                          action={async () => {
                            'use server';
                            await submitAssignment(assignment.id, studentId);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-sm px-3 py-1 rounded bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* All Assignments */}
            <section>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                All Assignments
              </h2>
              
              {/* Pending */}
              {pendingAssignments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                    Pending ({pendingAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingAssignments.map((assignment) => (
                      <AssignmentCard key={assignment.id} assignment={assignment} studentId={studentId} />
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted */}
              {submittedAssignments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                    Submitted ({submittedAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {submittedAssignments.map((assignment) => (
                      <AssignmentCard key={assignment.id} assignment={assignment} studentId={studentId} />
                    ))}
                  </div>
                </div>
              )}

              {/* Graded */}
              {gradedAssignments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                    Graded ({gradedAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {gradedAssignments.map((assignment) => (
                      <AssignmentCard key={assignment.id} assignment={assignment} studentId={studentId} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrolled Courses */}
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                Enrolled Courses
              </h2>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {course.code}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {course.name}
                        </p>
                      </div>
                      {course.grade && (
                        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                          {course.grade}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                      <p>{course.instructor}</p>
                      <p>{course.credits} credits • {course.semester}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, studentId }: { assignment: any; studentId: number }) {
  const isPending = !assignment.submission_status;
  const isGraded = assignment.submission_status === 'graded';
  const percentage = isGraded && assignment.points_earned !== null
    ? ((assignment.points_earned / assignment.max_points) * 100).toFixed(0)
    : null;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
            {assignment.title}
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {assignment.course_code}
          </p>
        </div>
        <div className="text-right ml-4">
          {isGraded && assignment.points_earned !== null ? (
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {assignment.points_earned}/{assignment.max_points}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {percentage}%
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {assignment.max_points} pts
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">
          Due: {new Date(assignment.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        {isPending ? (
          <form
            action={async () => {
              'use server';
              await submitAssignment(assignment.id, studentId);
            }}
          >
            <button
              type="submit"
              className="px-2 py-1 rounded bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Submit
            </button>
          </form>
        ) : (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isGraded
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
          }`}>
            {isGraded ? 'Graded' : 'Submitted'}
          </span>
        )}
      </div>
    </div>
  );
}
