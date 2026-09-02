'use client';

import Link from 'next/link';
import { type ChangeEvent, type FormEvent, useState } from 'react';

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function clearMessage() {
    setMessage(null);
  }

  function handleIdentifierChange(event: ChangeEvent<HTMLInputElement>) {
    setIdentifier(event.target.value);
    clearMessage();
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    clearMessage();
  }

  function handleRememberMeChange(event: ChangeEvent<HTMLInputElement>) {
    setRememberMe(event.target.checked);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      setMessage('Enter your email or phone number and password');

      return;
    }

    setMessage(
      'Sign-in will be connected after the authentication service is ready.',
    );
  }

  return (
    <section className="w-full max-w-md bg-card px-4 py-5 text-card-foreground sm:rounded-2xl sm:border sm:px-6 sm:py-6 sm:shadow-lg md:px-8 md:py-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold sm:text-2xl">Welcome back</h1>

        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          Sign in to continue to your workspace.
        </p>
      </div>

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

        <label className="block">
          <span className="mb-1 block text-sm font-medium sm:mb-1.5">
            Password
          </span>

          <input
            autoComplete="current-password"
            className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:min-h-11 sm:px-4 sm:text-sm"
            minLength={8}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <label className="flex min-h-10 items-center gap-2 text-muted-foreground">
            <input
              checked={rememberMe}
              className="size-4 shrink-0 accent-primary"
              onChange={handleRememberMeChange}
              type="checkbox"
            />

            <span>Remember me</span>
          </label>

          <Link
            className="font-medium text-primary transition hover:opacity-70"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        {message && (
          <p
            aria-live="polite"
            className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground sm:px-4 sm:py-3"
          >
            {message}
          </p>
        )}

        <button
          className="min-h-10 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:min-h-11 sm:py-2.5"
          type="submit"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground sm:mt-6">
        New to node chat?{' '}
        <Link
          className="font-medium text-primary transition hover:opacity-70"
          href="/sign-up"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
