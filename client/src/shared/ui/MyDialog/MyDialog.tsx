import './MyDialog.scss';

type Props = {
  children: React.ReactNode;
  onClose: () => void
}

export const MyDialog: React.FC<Props> = ({ children, onClose }) => {
  const handeOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;

    if (target.id === 'myDialog') {
      onClose();
    }
  };

  return (
    <div
      className="myDialog"
      id="myDialog"
      onClick={(e) => handeOnClick(e)}
    >
      <div className="myDialog__content">
        {children}
      </div>
    </div>
  )
}
