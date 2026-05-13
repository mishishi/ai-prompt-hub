import { ReactNode } from 'react';
import { TopNavbar } from './TopNavbar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[var(--color-bench-bg)]">
      <TopNavbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}