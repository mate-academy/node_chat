import { X } from 'lucide-react';

type Props = {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSubmit: () => void;
  buttonText: string;
};

export const DeleteRoomModal: React.FC<Props> = ({
  title,
  subtitle,
  onClose,
  onSubmit,
  buttonText,
}) => {
  return (
    <>
      <div className="modal-top flex-row-center">
        <h2>{title}</h2>
        <button onClick={onClose} className="modal-x-button">
          <X />
        </button>
      </div>
      <span>{subtitle}</span>
      <div className="modal-buttons flex-row-center">
        <button
          className="form-button modal-button  modal-cancel"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="form-button modal-button  modal-button-delete"
          onClick={onSubmit}
        >
          {buttonText}
        </button>
      </div>
    </>
  );
};
