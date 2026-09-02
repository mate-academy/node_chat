'use client';

import Link from 'next/link';
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import { ArrowLeftIcon, ShieldCheckIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type PasswordRequirementProps = {
  valid: boolean;
  children: ReactNode;
};

function PasswordRequirement({ valid, children }: PasswordRequirementProps) {
  const requirementClassName = cn(
    'flex items-center gap-1.5',
    valid ? 'text-primary' : 'text-muted-foreground',
  );

  return (
    <li className={requirementClassName}>
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center"
      >
        {valid ? '✓' : '○'}
      </span>

      <span>{children}</span>
    </li>
  );
}

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requirements = useMemo(
    () => ({
      minimumLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const meetsRequirements = Object.values(requirements).every(Boolean);

  const passwordsMatch =
    confirmedPassword.length > 0 && password === confirmedPassword;

  const isPasswordMismatch = confirmedPassword.length > 0 && !passwordsMatch;

  const canSubmit = meetsRequirements && passwordsMatch;

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    setSubmitted(false);
  }

  function handleConfirmedPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmedPassword(event.target.value);
    setSubmitted(false);
  }

  function togglePasswordVisibility() {
    setShowPassword((currentValue) => !currentValue);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <>
      <header className="relative flex min-h-14 shrink-0 items-center justify-center border-b px-14 lg:min-h-16 lg:justify-start lg:gap-3 lg:px-8">
        <Link
          aria-label="Back to security settings"
          className="absolute left-14 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground lg:static"
          href="/profile/security"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>

        <h1 className="truncate text-base font-semibold sm:text-lg">
          Change password
        </h1>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6 lg:p-8">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14 sm:rounded-2xl">
              <ShieldCheckIcon className="size-5 sm:size-7" />
            </div>

            <div className="mt-4 text-center sm:mt-6">
              <h2 className="text-xl font-semibold sm:text-2xl">
                Set a new password
              </h2>

              <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
                Choose a strong password for your account.
              </p>
            </div>

            <form
              className="mt-5 space-y-4 sm:mt-7 sm:space-y-5"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium sm:mb-2 sm:text-base">
                  New password
                </span>

                <div className="relative">
                  <input
                    autoComplete="new-password"
                    className="min-h-10 w-full rounded-xl border bg-background px-3 py-2 pr-16 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 sm:min-h-11 sm:px-4 sm:py-3 sm:pr-20 sm:text-base"
                    onChange={handlePasswordChange}
                    placeholder="Choose a password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />

                  <button
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute inset-y-1 right-1 flex min-w-12 items-center justify-center rounded-lg px-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:min-w-16 sm:text-sm"
                    onClick={togglePasswordVisibility}
                    type="button"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <section className="rounded-xl bg-muted/60 p-3 sm:p-4">
                <h3 className="text-xs font-medium sm:text-sm">
                  Password must include:
                </h3>

                <ul className="mt-2 grid gap-x-4 gap-y-1.5 text-xs sm:mt-3 sm:grid-cols-2 sm:gap-y-2 sm:text-sm">
                  <PasswordRequirement valid={requirements.minimumLength}>
                    8+ characters
                  </PasswordRequirement>

                  <PasswordRequirement valid={requirements.number}>
                    One number
                  </PasswordRequirement>

                  <PasswordRequirement valid={requirements.uppercase}>
                    One uppercase
                  </PasswordRequirement>

                  <PasswordRequirement valid={requirements.symbol}>
                    One symbol
                  </PasswordRequirement>
                </ul>
              </section>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium sm:mb-2 sm:text-base">
                  Confirm new password
                </span>

                <input
                  aria-invalid={isPasswordMismatch}
                  autoComplete="new-password"
                  className="min-h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:min-h-11 sm:px-4 sm:py-3 sm:text-base"
                  onChange={handleConfirmedPasswordChange}
                  placeholder="Repeat your password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={confirmedPassword}
                />

                {isPasswordMismatch && (
                  <p className="mt-1.5 text-xs text-destructive sm:mt-2 sm:text-sm">
                    Passwords do not match.
                  </p>
                )}
              </label>

              {submitted && (
                <p className="rounded-xl bg-muted px-3 py-2.5 text-xs text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Password updating will be connected with the authentication
                  service later.
                </p>
              )}

              <button
                className="min-h-10 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11 sm:py-3 sm:text-base"
                disabled={!canSubmit}
                type="submit"
              >
                Update password
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
