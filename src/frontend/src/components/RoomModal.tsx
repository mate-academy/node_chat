import { X } from 'lucide-react';

type Props = {
  title: string;
  subtitle: string;
  placeholder?: string;
  buttonText: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export const RoomModal: React.FC<Props> = ({
  title,
  subtitle,
  placeholder,
  buttonText,
  value,
  onChange,
  error,
  onClose,
  onSubmit,
}) => {
  return (
    <>
      <div className="modal-top flex-row-center">
        <h2>{title}</h2>
        <button onClick={onClose} className="modal-x-button">
          <X />
        </button>
      </div>
      <div className="modal-input-container">
        <span>{subtitle}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input"
        />
      </div>
      {error && <p className="notification-error">{error}</p>}
      <div className="modal-buttons flex-row-center">
        <button
          className="form-button modal-button  modal-cancel"
          onClick={onClose}
        >
          Cancel
        </button>
        <button className="form-button modal-button" onClick={onSubmit}>
          {buttonText}
        </button>
      </div>
    </>
  );
};
