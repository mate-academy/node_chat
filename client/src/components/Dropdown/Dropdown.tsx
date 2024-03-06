import * as R from 'react';
import cn from 'classnames';

type DropdownItem = {
  id: string;
  name: string;
  [key: string]: any;
};

type Props = {
  items: DropdownItem[],
  selectedItem: DropdownItem['name'],
  isProcessing: boolean,
  onSelectItem?: (itemId: DropdownItem['id']) => void,
  onCreateItem?: (data: { [key: string]: any }) => void,
  onRemoveItem?: (itemId: DropdownItem['id']) => void,
};

export const Dropdown: R.FC<Props> = ({
  items,
  selectedItem,
  isProcessing,
  onSelectItem = () => { },
  onCreateItem = () => { },
  onRemoveItem = () => { },
}) => {
  const [isOpen, setIsOpen] = R.useState(false);
  const [isEditing, setIsEditing] = R.useState(false);
  const [value, setValue] = R.useState(selectedItem);
  const inputRef: R.LegacyRef<HTMLInputElement> = R.useRef();

  const toggleDropdown = () => setIsOpen(prev => !prev);
  
  const handleRemove = (itemId) => {
    onRemoveItem(itemId);
  };
  
  const handleCreate = () => {
    onCreateItem({ name: value.trim() });
    setValue('');
    setIsEditing(false);
  };

  const handleKeyDown = (event: R.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className={`dropdown${isOpen ? ' is-active' : ''}`}>
      <div className="dropdown-trigger is-horizontal">
        <div className="field is-grouped">
          <div className={cn('control', 'm-0', {
            'is-loading': isProcessing,
          })}>
            <input
              type="text"
              className="input"
              ref={inputRef}
              placeholder="Select an item"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleCreate}
              disabled={isProcessing || !isEditing}
            />
          </div>
          <div className="control">
            <button className="button" onClick={() => handleRemove(selectedItem)}>
              <i className="fas fa-xmark" />
            </button>

            <button className="button" onClick={toggleDropdown}>
              <i className={cn("fas fa-angle-down", {
                'is-flap-v': isOpen,
              })} />
            </button>
          </div>
        </div>

        <div className="dropdown-menu" id="dropdown-menu" role="menu">
          <div className="dropdown-content">
            <div
              className="dropdown-item button is-text"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                  setIsEditing(true);
                  toggleDropdown();
                }
              }}
            >
              Open new room
            </div>
            <hr className="dropdown-divider" />
            {items.map((item) => (
              <button
                key={item.id}
                className={`dropdown-item button${item.id === selectedItem ? ' is-active' : ''}`}
                onClick={() => {
                  onSelectItem(item.id);
                  setValue(item.name);
                  toggleDropdown();
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};