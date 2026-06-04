import { useState } from 'react';
import { Container } from './components/container';
import { Registration } from './components/NameInput';
import Room from './components/Room';
import Chat from './components/Chat';

export type Page = 'room' | 'chat' | 'home';

function App() {
  const [name, setName] = useState('');
  const [page, setPage] = useState<Page>('room');
  const [idRoom, setIdRoom] = useState<string | null>(null);

  return (
    <>
      <Container className="">
        {page === 'home' && (
          <Registration name={name} onName={setName} onPage={setPage} />
        )}
        {page === 'room' && <Room onPage={setPage} onSetId={setIdRoom} />}
        {page === 'chat' && <Chat  idRoom={idRoom}/>}
      </Container>
    </>
  );
}

export default App;
