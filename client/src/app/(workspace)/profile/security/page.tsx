'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';

import { ArrowLeftIcon } from '@/components/icons';
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  parseChatProfile,
  subscribeToProfile,
} from '@/lib/profile-storage';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const storedProfile = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const profile = useMemo(
    () => parseChatProfile(storedProfile),
    [storedProfile],
  );

  if (!profile) {
    return null;
  }

  const identifier = profile.identifier?.trim();
  const email = identifier?.includes('@') ? identifier : null;
  const phone = identifier && !identifier.includes('@') ? identifier : null;

  const emailClassName = cn(
    'mt-1 min-w-0 truncate text-sm text-muted-foreground sm:text-base',
    !email && 'italic',
  );

  const phoneClassName = cn(
    'mt-1 min-w-0 truncate text-sm text-muted-foreground sm:text-base',
    !phone && 'italic',
  );

  return (
    <>
      <header className="relative flex min-h-14 shrink-0 items-center justify-center border-b px-14 lg:min-h-16 lg:justify-start lg:gap-3 lg:px-8">
        <Link
          aria-label="Back to profile"
          className="absolute left-14 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground lg:static"
          href="/profile"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>

        <h1 className="truncate text-base font-semibold sm:text-lg">
          Security settings
        </h1>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Keep your account secure
            </h2>

            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Manage your password and account identifiers.
            </p>
          </div>

          <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4 lg:mt-8">
            <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium sm:text-base">Password</h3>

                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Password authentication will be available later.
                </p>
              </div>

              <Link
                className="flex min-h-10 w-full shrink-0 items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted sm:w-auto sm:px-5 sm:py-3 sm:text-base"
                href="/profile/security/password"
              >
                Change password
              </Link>
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium sm:text-base">
                  Email address
                </h3>

                <p className={emailClassName}>{email ?? 'Not added'}</p>
              </div>

              <button
                className="min-h-10 w-full shrink-0 cursor-not-allowed rounded-xl border px-4 py-2 text-sm font-medium text-muted-foreground opacity-60 sm:w-auto sm:px-5 sm:py-3 sm:text-base"
                disabled
                title="Available after authentication is connected"
                type="button"
              >
                {email ? 'Change email' : 'Add email'}
              </button>
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium sm:text-base">
                  Phone number
                </h3>

                <p className={phoneClassName}>{phone ?? 'Not added'}</p>
              </div>

              <button
                className="min-h-10 w-full shrink-0 cursor-not-allowed rounded-xl border px-4 py-2 text-sm font-medium text-muted-foreground opacity-60 sm:w-auto sm:px-5 sm:py-3 sm:text-base"
                disabled
                title="Available after authentication is connected"
                type="button"
              >
                {phone ? 'Change phone' : 'Add phone'}
              </button>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
