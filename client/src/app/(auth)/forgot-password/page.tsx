'use client';

import Link from 'next/link';
import { type ChangeEvent, type FormEvent, useState } from 'react';

import { ArrowLeftIcon } from '@/components/icons';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleIdentifierChange(event: ChangeEvent<HTMLInputElement>) {
    setIdentifier(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier) {
      return;
    }

    console.log('Future POST /auth/password/forgot payload:', {
      identifier: normalizedIdentifier,
    });

    setIsSubmitted(true);
  }

  return (
    <section className="w-full max-w-md bg-card px-4 py-5 text-card-foreground sm:rounded-2xl sm:border sm:px-6 sm:py-6 sm:shadow-lg md:px-8 md:py-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Forgot your password?
        </h1>

        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          Enter your email or phone number and we&apos;ll send you reset
          instructions.
        </p>
      </div>

      {isSubmitted ? (
        <div className="mt-5 sm:mt-6">
          <p
            aria-live="polite"
            className="rounded-xl bg-primary/10 px-3 py-3 text-sm text-primary sm:px-4 sm:py-4"
          >
            If an account exists for this email or phone number, reset
            instructions will be sent shortly.
          </p>

          <Link
            className="mt-4 flex min-h-10 w-full items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted sm:mt-6 sm:min-h-11 sm:py-2.5"
            href="/sign-in"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form
          className="mt-5 space-y-4 sm:mt-6 sm:space-y-5"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium sm:mb-1.5">
              Email or phone number
            </span>

            <input
              autoComplete="username"
              className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:min-h-11 sm:px-4 sm:text-sm"
              onChange={handleIdentifierChange}
              placeholder="you@company.com or +15065551234"
              required
              value={identifier}
            />
          </label>

          <button
            className="min-h-10 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:py-2.5"
            disabled={!identifier.trim()}
            type="submit"
          >
            Send reset instructions
          </button>

          <Link
            className="flex min-h-10 items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            href="/sign-in"
          >
            <ArrowLeftIcon className="size-4 shrink-0" />

            <span>Back to sign in</span>
          </Link>
        </form>
      )}
    </section>
  );
}
