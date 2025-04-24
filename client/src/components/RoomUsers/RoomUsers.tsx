import React from 'react';
import { Box, Heading } from 'react-bulma-components';
interface Props {
  users: string[];
}
export const RoomUsers: React.FC<Props> = ({ users = [] }) => {
  return (
    <Box
      style={{
        flex: '1 1 0',
        overflowY: 'auto',
        minHeight: '0',
      }}
    >
      {users.map((user) => {
        return <Heading key={user}>{user}</Heading>;
      })}
    </Box>
  );
};
