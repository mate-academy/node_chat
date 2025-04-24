import { Box } from 'react-bulma-components';

interface Props {
  userName: string;
  createdAt: Date;
  text: string;
}

function formatDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month}-${day}-${year} ${hours}-${minutes}`;
}

export const ChatMessage: React.FC<Props> = ({ createdAt, text, userName }) => {
  return (
    <Box className="is-flex is-flex-direction-column py-3 m-2">
      <div className="is-flex is-justify-content-space-between">
        <span>{userName}</span>
        <span>{formatDate(createdAt)}</span>
      </div>
      <p style={{ whiteSpace: 'pre-wrap' }} className="pt-3">
        {text}
      </p>
    </Box>
  );
};
