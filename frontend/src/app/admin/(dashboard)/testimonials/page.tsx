'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import type { Testimonial } from '@/lib/types';

export default function AdminTestimonialsPage() {
  return (
    <CollectionManager<Testimonial>
      kind="testimonials"
      title="Testimonials"
      description="Real quotes from customers. Shown on the home page once at least one is visible."
      singular="testimonial"
      imageLabel="Photo (optional)"
      imageClassName="mx-auto my-4 size-20 rounded-full object-cover"
      fields={[
        { name: 'name', label: 'Name', required: true, minLength: 2, maxLength: 120 },
        { name: 'role', label: 'Role / title', maxLength: 120, placeholder: 'e.g. Head Teacher' },
        { name: 'organization', label: 'Organization', maxLength: 160, wide: true },
        { name: 'quote', label: 'Quote', type: 'textarea', required: true, minLength: 10, maxLength: 1000 },
      ]}
      primary={(t) => t.name}
      secondary={(t) => [t.role, t.organization].filter(Boolean).join(', ')}
      detail={(t) => `“${t.quote}”`}
    />
  );
}
