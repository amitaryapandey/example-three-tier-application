'use client';

import { useRef } from 'react';

type StudentFormProps = {
  action: (formData: FormData) => Promise<any>;
  initialData?: {
    name: string;
    email: string;
    grade: string;
    enrollment_date: string;
    status: string;
    gpa: number | null;
  };
  submitLabel?: string;
};

export default function StudentForm({ action, initialData, submitLabel = 'Add Student' }: StudentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      await action(formData);
      formRef.current?.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          placeholder="John Doe"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={initialData?.email}
          placeholder="john.doe@example.com"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="grade" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Grade *
        </label>
        <select
          id="grade"
          name="grade"
          required
          defaultValue={initialData?.grade}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="">Select grade...</option>
          <option value="9th">9th Grade</option>
          <option value="10th">10th Grade</option>
          <option value="11th">11th Grade</option>
          <option value="12th">12th Grade</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
        </select>
      </div>

      <div>
        <label htmlFor="enrollment_date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Enrollment Date
        </label>
        <input
          id="enrollment_date"
          name="enrollment_date"
          type="date"
          defaultValue={initialData?.enrollment_date}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Status *
        </label>
        <select
          id="status"
          name="status"
          required
          defaultValue={initialData?.status || 'active'}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div>
        <label htmlFor="gpa" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          GPA (0.00 - 4.00)
        </label>
        <input
          id="gpa"
          name="gpa"
          type="number"
          step="0.01"
          min="0"
          max="4"
          defaultValue={initialData?.gpa || ''}
          placeholder="3.75"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}
