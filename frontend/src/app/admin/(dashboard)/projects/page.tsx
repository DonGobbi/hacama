'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import type { Project } from '@/lib/types';

export default function AdminProjectsPage() {
  return (
    <CollectionManager<Project>
      kind="projects"
      title="Past projects"
      description='Short write-ups of completed work, e.g. "Supplied 200 desks to X school".'
      singular="project"
      imageLabel="Image (optional)"
      fields={[
        { name: 'title', label: 'Title', required: true, minLength: 3, maxLength: 200, wide: true },
        { name: 'client', label: 'Client', maxLength: 160 },
        { name: 'category', label: 'Category', maxLength: 120, placeholder: 'e.g. Education & Institutional Supplies' },
        { name: 'year', label: 'Year', maxLength: 20, placeholder: 'e.g. 2024' },
        { name: 'summary', label: 'Summary', type: 'textarea', maxLength: 2000 },
        {
          name: 'details',
          label: 'Details (shown on the project page)',
          type: 'textarea',
          maxLength: 10000,
          wide: true,
          placeholder: 'Full case study: scope, items supplied, outcome...',
        },
      ]}
      primary={(p) => p.title}
      secondary={(p) => [p.client, p.year].filter(Boolean).join(' · ')}
      detail={(p) => p.summary}
    />
  );
}
