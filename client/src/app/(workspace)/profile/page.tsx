'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  ArrowLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
} from '@/components/icons';
import { updateChatProfile } from '@/lib/api';
import {
  clearChatProfile,
  getProfileSnapshot,
  getServerProfileSnapshot,
  parseChatProfile,
  saveChatProfile,
  subscribeToProfile,
} from '@/lib/profile-storage';

type UpdateProfileInput = {
  profileId: string;
  displayName: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();

  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const profile = useMemo(
    () => parseChatProfile(storedProfile),
    [storedProfile],
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const updateProfile = useMutation({
    mutationFn: ({ profileId, displayName }: UpdateProfileInput) =>
      updateChatProfile(profileId, displayName),

    onSuccess: (updatedProfile) => {
      saveChatProfile({
        ...updatedProfile,
        identifier: profile?.identifier,
      });

      setDisplayName('');
      setIsEditingName(false);
    },
  });

  if (!profile) {
    return null;
  }

  const currentProfile = profile;
  const normalizedDisplayName = displayName.trim();

  const canSaveDisplayName =
    normalizedDisplayName.length >= 2 &&
    normalizedDisplayName !== currentProfile.displayName &&
    !updateProfile.isPending;

  function startEditing() {
    setDisplayName(currentProfile.displayName);
    setIsEditingName(true);
    updateProfile.reset();
  }

  function cancelEditing() {
    setDisplayName('');
    setIsEditingName(false);
    updateProfile.reset();
  }

  function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
    setDisplayName(event.target.value);
    updateProfile.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSaveDisplayName) {
      return;
    }

    updateProfile.mutate({
      profileId: currentProfile.id,
      displayName: normalizedDisplayName,
    });
  }

  function handleLogout() {
    clearChatProfile();
    router.replace('/');
  }

  return (
    <>
      <header className="flex min-h-14 shrink-0 items-center gap-2 border-b px-4 sm:min-h-16 sm:gap-3 sm:px-6 md:px-8">
        <Link
          aria-label="Back to chat"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          href="/chat"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>

        <h1 className="truncate text-base font-semibold sm:text-lg">
          Your profile
        </h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <section className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary sm:size-16 sm:text-xl">
              {getInitials(currentProfile.displayName)}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-semibold sm:text-2xl">
                {currentProfile.displayName}
              </h2>

              <p className="mt-0.5 truncate text-sm text-muted-foreground sm:mt-1">
                {currentProfile.identifier ?? 'Sign-in identifier unavailable'}
              </p>
            </div>

            <span className="ml-auto shrink-0 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:py-1.5 sm:text-sm">
              Active
            </span>
          </section>

          <div className="mt-5 overflow-hidden rounded-xl border bg-card text-card-foreground sm:mt-8 sm:rounded-2xl">
            <section className="flex min-h-20 items-center gap-4 px-4 py-4 sm:min-h-24 sm:gap-5 sm:px-6 sm:py-5">
              {isEditingName ? (
                <form
                  className="flex w-full flex-col gap-3 sm:flex-row sm:items-end"
                  onSubmit={handleSubmit}
                >
                  <label className="min-w-0 flex-1">
                    <span className="mb-1 block text-sm font-medium sm:mb-1.5">
                      Display name
                    </span>

                    <input
                      autoFocus
                      className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition focus:ring-2 focus:ring-ring/30 sm:min-h-11 sm:px-4 sm:text-sm"
                      maxLength={50}
                      minLength={2}
                      onChange={handleDisplayNameChange}
                      required
                      value={displayName}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      className="min-h-10 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11"
                      disabled={!canSaveDisplayName}
                      type="submit"
                    >
                      {updateProfile.isPending ? 'Saving...' : 'Save'}
                    </button>

                    <button
                      className="min-h-10 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11"
                      disabled={updateProfile.isPending}
                      onClick={cancelEditing}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium sm:text-base">
                      Display name
                    </h3>

                    <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
                      {currentProfile.displayName}
                    </p>
                  </div>

                  <button
                    className="min-h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary transition hover:bg-primary/10 sm:text-base"
                    onClick={startEditing}
                    type="button"
                  >
                    Edit
                  </button>
                </>
              )}
            </section>

            {updateProfile.error && (
              <p
                aria-live="polite"
                className="border-t px-4 py-3 text-sm text-destructive sm:px-6"
              >
                {updateProfile.error.message}
              </p>
            )}

            <Link
              className="flex min-h-20 w-full items-center gap-4 border-t px-4 py-4 text-left transition hover:bg-muted/40 sm:min-h-24 sm:gap-5 sm:px-6 sm:py-5"
              href="/profile/security"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium sm:text-base">Security</h3>

                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Manage your sign-in and account access
                </p>
              </div>

              <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
            </Link>

            <button
              className="flex min-h-16 w-full items-center gap-3 border-t px-4 py-4 text-left text-sm font-medium text-destructive transition hover:bg-destructive/5 sm:min-h-20 sm:px-6 sm:py-5 sm:text-base"
              onClick={handleLogout}
              type="button"
            >
              <LogOutIcon className="size-5 shrink-0" />

              <span>Log out</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
