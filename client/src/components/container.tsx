import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className = '' }: ContainerProps) => {
  return (
    <div
      className={`mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};
