'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { JobForm } from '@/components/admin/JobForm';
import { adminApi } from '@/lib/api';
import type { Job } from '@/lib/types';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .job(id)
      .then(setJob)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  return (
    <>
      <PageHeader title="Edit job" description={job?.title} />
      <ErrorNote message={error} />
      {job ? <JobForm job={job} /> : !error && <div className="card h-96 animate-pulse bg-slate-100" />}
    </>
  );
}
