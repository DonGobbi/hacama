'use client';

import { CollectionManager } from '@/components/admin/CollectionManager';
import type { Demand } from '@/lib/types';

export default function AdminDemandsPage() {
  return (
    <CollectionManager<Demand>
      kind="demands"
      title="Market Demands"
      description="Commodities Hacama is looking to buy — shown on the We Buy page once visible. Mark as fulfilled when the deal is done."
      singular="demand"
      imageLabel="Photo (optional — e.g. the commodity)"
      fields={[
        {
          name: 'title',
          label: 'What are you buying?',
          required: true,
          minLength: 3,
          maxLength: 160,
          wide: true,
          placeholder: 'e.g. White grain maize',
        },
        {
          name: 'quantity',
          label: 'Quantity needed',
          required: true,
          maxLength: 160,
          placeholder: 'e.g. 8,000 bags (400 MT)',
        },
        {
          name: 'price',
          label: 'Offered price',
          maxLength: 160,
          placeholder: 'e.g. MK40,000 / 50kg bag',
        },
        {
          name: 'location',
          label: 'Location',
          maxLength: 160,
          placeholder: 'e.g. Lilongwe',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'open', label: 'Open — still buying' },
            { value: 'fulfilled', label: 'Fulfilled — deal done' },
          ],
        },
        {
          name: 'contact',
          label: 'Contact for suppliers (optional — defaults to site phone/WhatsApp)',
          maxLength: 300,
          wide: true,
          placeholder: 'e.g. WhatsApp or call 0997 20 07 00, or visit Bingu National Stadium Corporate Box E19',
        },
        {
          name: 'details',
          label: 'Extra details (optional)',
          type: 'textarea',
          maxLength: 5000,
          placeholder: 'Specs, delivery terms, payment terms, deadlines...',
        },
      ]}
      primary={(d) => d.title}
      secondary={(d) => `${d.quantity}${d.location ? ` · ${d.location}` : ''}`}
      detail={(d) => `${d.status === 'fulfilled' ? 'Fulfilled' : 'Open'}${d.price ? ` · ${d.price}` : ''}`}
    />
  );
}
