'use client';

import Link from 'next/link';
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

type IdentifierType = 'email' | 'phone';

type PasswordRequirementProps = {
  valid: boolean;
  children: ReactNode;
};

function PasswordRequirement({ valid, children }: PasswordRequirementProps) {
  const requirementClassName = cn(
    'flex min-w-0 items-center gap-1.5',
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

      <span className="truncate">{children}</span>
    </li>
  );
}

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState('');
  const [identifierType, setIdentifierType] = useState<IdentifierType>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const requirements = useMemo(
    () => ({
      minimumLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const isEmailIdentifier = identifierType === 'email';

  const meetsRequirements = Object.values(requirements).every(Boolean);

  const passwordsMatch =
    confirmedPassword.length > 0 && password === confirmedPassword;

  const canSubmit =
    displayName.trim().length >= 2 &&
    identifier.trim().length > 0 &&
    meetsRequirements &&
    passwordsMatch;

  const emailButtonClassName = cn(
    'min-h-9 rounded-lg px-4 py-1.5 text-sm transition',
    isEmailIdentifier
      ? 'bg-card font-medium text-primary shadow-sm'
      : 'text-muted-foreground hover:text-foreground',
  );

  const phoneButtonClassName = cn(
    'min-h-9 rounded-lg px-4 py-1.5 text-sm transition',
    !isEmailIdentifier
      ? 'bg-card font-medium text-primary shadow-sm'
      : 'text-muted-foreground hover:text-foreground',
  );

  const identifierLabel = isEmailIdentifier ? 'Email' : 'Phone number';
  const identifierAutoComplete = isEmailIdentifier ? 'email' : 'tel';
  const identifierInputMode = isEmailIdentifier ? 'email' : 'tel';
  const identifierInputType = isEmailIdentifier ? 'email' : 'tel';

  const identifierPlaceholder = isEmailIdentifier
    ? 'you@company.com'
    : '+15065551234';

  const identifierPattern = isEmailIdentifier
    ? undefined
    : String.raw`\+[1-9][0-9]{7,14}`;

  function clearMessage() {
    setMessage(null);
  }

  function selectIdentifierType(type: IdentifierType) {
    setIdentifierType(type);
    setIdentifier('');
    clearMessage();
  }

  function handleDisplayNameChange(event: ChangeEvent<HTMLInputElement>) {
    setDisplayName(event.target.value);
    clearMessage();
  }

  function handleIdentifierChange(event: ChangeEvent<HTMLInputElement>) {
    setIdentifier(event.target.value);
    clearMessage();
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    clearMessage();
  }

  function handleConfirmedPasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setConfirmedPassword(event.target.value);
    clearMessage();
  }

  function handleEmailTypeSelect() {
    selectIdentifierType('email');
  }

  function handlePhoneTypeSelect() {
    selectIdentifierType('phone');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const normalizedIdentifier = isEmailIdentifier
      ? identifier.trim().toLowerCase()
      : identifier.trim().replace(/[\s()-]/g, '');

    const payload = isEmailIdentifier
      ? {
          displayName: displayName.trim(),
          email: normalizedIdentifier,
          password,
        }
      : {
          displayName: displayName.trim(),
          phone: normalizedIdentifier,
          password,
        };

    console.log('Future POST /auth/register payload:', payload);

    setMessage(
      'Account creation will be connected after the authentication service is ready.',
    );
  }

  return (
    <section className="w-full max-w-md bg-card px-4 py-4 text-card-foreground sm:rounded-2xl sm:border sm:px-6 sm:py-6 sm:shadow-lg md:px-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Create your account
        </h1>

        <p className="mt-1 text-sm text-muted-foreground sm:mt-1.5">
          A calm place for focused conversation.
        </p>
      </div>

      <form
        className="mt-4 space-y-3 sm:mt-5 sm:space-y-4"
        onSubmit={handleSubmit}
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name</span>

          <input
            autoComplete="name"
            className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:px-4 sm:text-sm"
            maxLength={50}
            minLength={2}
            onChange={handleDisplayNameChange}
            placeholder="Alex Morgan"
            required
            value={displayName}
          />
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">
            Create account with
          </legend>

          <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
            <button
              aria-pressed={isEmailIdentifier}
              className={emailButtonClassName}
              onClick={handleEmailTypeSelect}
              type="button"
            >
              Email
            </button>

            <button
              aria-pressed={!isEmailIdentifier}
              className={phoneButtonClassName}
              onClick={handlePhoneTypeSelect}
              type="button"
            >
              Phone
            </button>
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            {identifierLabel}
          </span>

          <input
            autoComplete={identifierAutoComplete}
            className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:px-4 sm:text-sm"
            inputMode={identifierInputMode}
            onChange={handleIdentifierChange}
            pattern={identifierPattern}
            placeholder={identifierPlaceholder}
            required
            type={identifierInputType}
            value={identifier}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Password</span>

          <input
            autoComplete="new-password"
            className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:px-4 sm:text-sm"
            onChange={handlePasswordChange}
            placeholder="Create a password"
            required
            type="password"
            value={password}
          />
        </label>

        <section
          aria-labelledby="password-requirements"
          className="rounded-xl bg-muted/60 p-3"
        >
          <h2 className="text-xs font-medium" id="password-requirements">
            Password must include:
          </h2>

          <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
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
          <span className="mb-1 block text-sm font-medium">
            Confirm password
          </span>

          <input
            aria-invalid={confirmedPassword.length > 0 && !passwordsMatch}
            autoComplete="new-password"
            className="min-h-10 w-full rounded-xl border bg-background px-3.5 py-2 text-base outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:px-4 sm:text-sm"
            onChange={handleConfirmedPasswordChange}
            placeholder="Repeat your password"
            required
            type="password"
            value={confirmedPassword}
          />

          {confirmedPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1 text-xs text-destructive">
              Passwords do not match.
            </p>
          )}
        </label>

        {message && (
          <p className="rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        )}

        <button
          className="min-h-10 w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11"
          disabled={!canSubmit}
          type="submit"
        >
          Create account
        </button>
      </form>

      <p className="mt-3 text-center text-sm text-muted-foreground sm:mt-5">
        Already have an account?{' '}
        <Link
          className="font-medium text-primary transition hover:opacity-70"
          href="/sign-in"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
