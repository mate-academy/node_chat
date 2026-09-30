interface DialogActionsProps {
  onClose: () => void;
  submitLabel: string;
  disabled?: boolean;
  danger?: boolean;
}

export const DialogActions = ({
  onClose,
  submitLabel,
  disabled,
  danger,
}: DialogActionsProps) => {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-text
                   focus-visible:outline-2 focus-visible:outline-accent"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={disabled}
        autoFocus={danger}
        className={`rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90
                    disabled:cursor-not-allowed disabled:opacity-30
                    focus-visible:outline-2 focus-visible:outline-offset-2
                    ${
                      danger
                        ? "bg-red-400 text-black focus-visible:outline-red-400"
                        : "bg-accent text-black focus-visible:outline-accent"
                    }`}
      >
        {submitLabel}
      </button>
    </div>
  );
};
