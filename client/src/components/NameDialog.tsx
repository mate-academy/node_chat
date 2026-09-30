import { useState } from "react";
import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

interface NameDialogProps {
  title: string;
  description?: string;
  initial?: string;
  submitLabel: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export const NameDialog = ({
  title,
  description = "",
  initial = "",
  submitLabel,
  onSubmit,
  onClose,
}: NameDialogProps) => {
  const [name, setName] = useState(initial);
  const value = name.trim();
  const canSubmit = value && value !== initial;

  return (
    <Dialog
      title={title}
      description={description}
      onClose={onClose}
      onSubmit={() => canSubmit && (onSubmit(value), onClose())}
    >
      <input
        autoFocus
        onFocus={(e) => e.target.select()}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={32}
        placeholder="room-name"
        className="mt-4 w-full rounded-md border border-line bg-bg px-3 py-2.5 font-mono text-sm placeholder:text-zinc-600 outline-none transition-colors focus:border-accent"
      />
      <DialogActions
        onClose={onClose}
        submitLabel={submitLabel}
        disabled={!canSubmit}
      />
    </Dialog>
  );
};
