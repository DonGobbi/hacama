'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/api';

export function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('hacama-visit')) return;
      sessionStorage.setItem('hacama-visit', '1');
    } catch {
      // Storage unavailable (e.g. private mode) — still record the visit.
    }
    fetch(`${API_URL}/activity/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
