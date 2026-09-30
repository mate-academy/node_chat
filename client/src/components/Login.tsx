import { useState } from "react";

export const Login = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (value) onLogin(value);
  }
  
  return (
    <div className="flex h-full items-center justify-center px-6">
      <form onSubmit={submit}>
        <h1 className="font-mono text-lg text-text">
          <span className="text-accent">$</span> chat login
        </h1>
        <p className="mt-2 text-sm text-muted">Enter your name.</p>

        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="mt-8 w-full rounded-md border border-line bg-panel px-3 py-2.5 font-mono text-sm
                     placeholder:text-zinc-600 outline-none transition-colors
                     focus:border-accent"
        />
        <button
          disabled={!name.trim()}
          className="mt-3 w-full rounded-md bg-accent px-3 py-2.5 text-sm font-medium text-black
                     transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Log in
        </button>
      </form>
    </div>
  );
};
