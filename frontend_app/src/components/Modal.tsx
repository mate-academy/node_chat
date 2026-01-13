import React, { useState } from "react";

interface Props {
  title: string;
  initial?: string;
  onConfirm: (v: string) => void;
  onCancel?: () => void;
}

export const Modal: React.FC<Props> = ({
  title,
  initial = "",
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(initial);
  return (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="button" onClick={() => onConfirm(value)}>
            OK
          </button>
          <button className="button secondary" onClick={() => onCancel?.()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
