'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { createChatProfile, type CreateChatProfileInput } from '@/lib/api';
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  parseChatProfile,
  saveChatProfile,
  subscribeToProfile,
} from '@/lib/profile-storage';

type IdentifierType = 'email' | 'phone';

export default function Home() {
  const router = useRouter();
  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const existingProfile = useMemo(
    () => parseChatProfile(storedProfile),
    [storedProfile],
  );

  const [displayName, setDisplayName] = useState('');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('email');
  const [identifier, setIdentifier] = useState('');

  const openProfile = useMutation({
    mutationFn: createChatProfile,
    onSuccess: (profile) => {
      saveChatProfile(profile);
      router.push('/chat');
    },
  });

  useEffect(() => {
    if (existingProfile) {
      router.replace('/chat');
    }
  }, [existingProfile, router]);

  function selectIdentifierType(type: IdentifierType) {
    setIdentifierType(type);
    setIdentifier('');
    openProfile.reset();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = displayName.trim();
    const normalizedIdentifier =
      identifierType === 'email'
        ? identifier.trim().toLowerCase()
        : identifier.trim().replace(/[\s()-]/g, '');

    if (normalizedName.length < 2 || !normalizedIdentifier) {
      return;
    }

    const input: CreateChatProfileInput =
      identifierType === 'email'
        ? {
            displayName: normalizedName,
            email: normalizedIdentifier,
          }
        : {
            displayName: normalizedName,
            phone: normalizedIdentifier,
          };

    openProfile.mutate(input);
  }

  if (existingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Opening chat...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl shadow-foreground/5 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Join the chat</h1>

        <p className="mt-2 text-muted-foreground">
          Enter your name and email or phone number.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block font-medium">Display name</span>

            <input
              autoFocus
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              maxLength={50}
              minLength={2}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Anton"
              required
              value={displayName}
            />
          </label>

          <div>
            <span className="mb-2 block font-medium">Continue with</span>

            <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
              <button
                className={`rounded-lg px-4 py-2.5 transition ${
                  identifierType === 'email'
                    ? 'bg-card font-medium text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => selectIdentifierType('email')}
                type="button"
              >
                Email
              </button>

              <button
                className={`rounded-lg px-4 py-2.5 transition ${
                  identifierType === 'phone'
                    ? 'bg-card font-medium text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => selectIdentifierType('phone')}
                type="button"
              >
                Phone
              </button>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block font-medium">
              {identifierType === 'email' ? 'Email' : 'Phone number'}
            </span>

            <input
              autoComplete={identifierType === 'email' ? 'email' : 'tel'}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              inputMode={identifierType === 'email' ? 'email' : 'tel'}
              onChange={(event) => setIdentifier(event.target.value)}
              pattern={
                identifierType === 'phone'
                  ? String.raw`\+[1-9][0-9]{7,14}`
                  : undefined
              }
              placeholder={
                identifierType === 'email'
                  ? 'anton@example.com'
                  : '+15065551234'
              }
              required
              type={identifierType === 'email' ? 'email' : 'tel'}
              value={identifier}
            />
          </label>

          {identifierType === 'phone' && (
            <p className="text-sm text-muted-foreground">
              Use international format, for example +15065551234.
            </p>
          )}

          {openProfile.error && (
            <p
              className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {openProfile.error.message}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={openProfile.isPending}
            type="submit"
          >
            {openProfile.isPending ? 'Opening...' : 'Continue'}
          </button>
        </form>
      </section>
    </main>
  );
}
