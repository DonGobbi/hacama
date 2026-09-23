'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import type { Partner } from '@/lib/types';

export default function AdminPartnersPage() {
  return (
    <CollectionManager<Partner>
      kind="partners"
      title="Clients & partners"
      description="Logos of organizations you have supplied or partnered with. Only add ones you have permission to show."
      singular="partner"
      imageLabel="Logo"
      imageClassName="mx-auto h-24 w-full object-contain p-4"
      fields={[
        { name: 'name', label: 'Organization name', required: true, minLength: 2, maxLength: 160 },
        { name: 'website', label: 'Website', type: 'url', maxLength: 300, placeholder: 'https://' },
      ]}
      primary={(p) => p.name}
      secondary={(p) => p.website}
    />
  );
}
