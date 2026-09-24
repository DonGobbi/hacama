'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import type { News } from '@/lib/types';

export default function AdminNewsPage() {
  return (
    <CollectionManager<News>
      kind="news"
      title="News & Updates"
      description="Company announcements, tender wins, and completed projects. Shown on the News page once visible."
      singular="article"
      imageLabel="Cover image (optional)"
      fields={[
        { name: 'title', label: 'Headline', required: true, minLength: 4, maxLength: 160, wide: true },
        {
          name: 'category',
          label: 'Category',
          maxLength: 80,
          placeholder: 'e.g. Announcement, Tender win, Project completed',
        },
        { name: 'summary', label: 'Summary', type: 'textarea', required: true, minLength: 10, maxLength: 400 },
        { name: 'body', label: 'Full story (optional)', type: 'textarea', maxLength: 10000 },
      ]}
      primary={(n) => n.title}
      secondary={(n) => n.category}
      detail={(n) => n.summary}
    />
  );
}
