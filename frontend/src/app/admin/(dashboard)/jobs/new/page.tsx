import { PageHeader } from '@/components/admin/AdminShell';
import { JobForm } from '@/components/admin/JobForm';

export default function NewJobPage() {
  return (
    <>
      <PageHeader title="New job" description="Save as draft, or set status to Open to publish it on the website." />
      <JobForm />
    </>
  );
}
