import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col bg-background px-4 py-4 text-foreground sm:px-6">
      <div className="flex flex-1 items-center justify-center py-4">
        {children}
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        By continuing, you agree to node chat&apos;s Terms and Privacy Policy.
      </p>
    </main>
  );
}
