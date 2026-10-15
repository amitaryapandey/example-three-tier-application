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
  grade: string;
  enrollment_date: string;
  status: string;
  gpa: number | null;
  created_at: string;
  updated_at: string;
};

// ===== TASK ACTIONS =====

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

// ===== STUDENT ACTIONS =====

export async function getStudents(status?: string): Promise<Student[]> {
  const url = status 
    ? `${API_URL}/students?status=${encodeURIComponent(status)}`
    : `${API_URL}/students`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudent(id: number): Promise<Student> {
  const res = await fetch(`${API_URL}/students/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch student');
  return res.json();
}

export async function createStudent(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const grade = formData.get('grade') as string;
  const enrollment_date = formData.get('enrollment_date') as string;
  const status = formData.get('status') as string;
  const gpaValue = formData.get('gpa') as string;
  const gpa = gpaValue ? parseFloat(gpaValue) : null;

  const res = await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, grade, enrollment_date, status, gpa }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create student');
  }

  revalidatePath('/students');
  return res.json();
}

export async function updateStudent(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const grade = formData.get('grade') as string;
  const enrollment_date = formData.get('enrollment_date') as string;
  const status = formData.get('status') as string;
  const gpaValue = formData.get('gpa') as string;
  const gpa = gpaValue ? parseFloat(gpaValue) : null;

  const res = await fetch(`${API_URL}/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, grade, enrollment_date, status, gpa }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update student');
  }

  revalidatePath('/students');
  return res.json();
}

export async function deleteStudent(id: number) {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete student');
  }

  revalidatePath('/students');
  return res.json();
}
