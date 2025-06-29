// components/ThinkBlock.tsx
import { useState } from 'react';

export default function ThinkBlock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-2 border-l-4 border-blue-400 bg-blue-50 p-3 rounded">
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 font-medium underline mb-1"
      >
        {open ? 'Hide Thoughts' : 'Show Thoughts'}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
