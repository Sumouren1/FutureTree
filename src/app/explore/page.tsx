'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TreeGrowth from '@/components/Animation/SeedGrowth';

export default function ExplorePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('futureTree');
    if (!stored) {
      router.push('/');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="workspace">
        <div className="handwritten text-6xl text-accent-orange">Loading...</div>
      </div>
    );
  }

  return <TreeGrowth />;
}
