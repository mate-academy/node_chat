'use client';

import { useRouter } from 'next/navigation';
import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { WorkspaceSidebar } from '@/features/chat/workspace-sidebar';
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  parseChatProfile,
  subscribeToProfile,
} from '@/lib/profile-storage';
import { cn } from '@/lib/utils';

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const profile = useMemo(
    () => parseChatProfile(storedProfile),
    [storedProfile],
  );

  const backdropClassName = cn(
    'fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
    isSidebarOpen
      ? 'visible opacity-100'
      : 'invisible pointer-events-none opacity-0',
  );

  useEffect(() => {
    if (!profile) {
      router.replace('/');
    }
  }, [profile, router]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function toggleSidebar() {
    setIsSidebarOpen((currentValue) => !currentValue);
  }

  if (!profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Opening sign in...</p>
      </main>
    );
  }

  return (
    <main className="flex h-dvh overflow-hidden bg-background text-foreground">
      <button
        aria-label="Close navigation"
        className={backdropClassName}
        onClick={closeSidebar}
        tabIndex={isSidebarOpen ? 0 : -1}
        type="button"
      />

      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        profile={profile}
      />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </section>
    </main>
  );
}
