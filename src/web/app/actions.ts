'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:3001';

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

export type Student = {
  id: number;
  name: string;
  email: string;
  student_id: string;
  major: string;
  year: number;
  gpa: number | null;
  created_at: string;
};

export type Course = {
  id: number;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  semester: string;
  grade?: string;
  status?: string;
  enrolled_at?: string;
};

export type Assignment = {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  due_date: string;
  max_points: number;
  course_code: string;
  course_name: string;
  points_earned: number | null;
  submitted_at: string | null;
  submission_status: string | null;
};

export type DashboardData = {
  student: Student;
  courses: Course[];
  assignments: Assignment[];
  statistics: {
    totalCourses: number;
    totalAssignments: number;
    submittedAssignments: number;
    gradedAssignments: number;
    averageScore: string | null;
  };
  upcomingAssignments: Assignment[];
};

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string;
  await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  revalidatePath('/');
}

export async function toggleTask(id: number, completed: boolean) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  revalidatePath('/');
}

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_URL}/students`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudentDashboard(studentId: number): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/students/${studentId}/dashboard`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch student dashboard');
  return res.json();
}

export async function submitAssignment(assignmentId: number, studentId: number) {
  const res = await fetch(`${API_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignment_id: assignmentId, student_id: studentId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to submit assignment');
  }
  revalidatePath(`/students/${studentId}`);
  return res.json();
}
