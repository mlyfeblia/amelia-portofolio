'use client';

import React, { useState, useCallback } from 'react';
import { AnonymousMessage } from '@/types';
import { CurhatForm } from './counseling/CurhatForm';
import { CurhatWall } from './counseling/CurhatWall';

interface CurhatSectionProps {
  initialMessages?: AnonymousMessage[];
}

export default function CurhatSection({ initialMessages = [] }: CurhatSectionProps) {
  const [list, setList] = useState<AnonymousMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/curhat');
      const data = await res.json();
      if (data.success) {
        setList(data.data.filter((c: AnonymousMessage) => c.isPublic));
      }
    } catch (e) {
      console.error('Failed to load curhat:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <div className="md:col-span-5">
        <CurhatForm onSuccess={fetchList} />
      </div>
      <div className="md:col-span-7">
        <CurhatWall messages={list} loading={loading} />
      </div>
    </div>
  );
}
