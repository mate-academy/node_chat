import './MyButton.scss';

type Props = {
  children: React.ReactNode,
  onClick?: () => void;
}

export const MyButton: React.FC<Props> = ({ children, ...props }) => {
  return (
    <button {...props} className='myButton'>{children}</button>
  )
}
