import { useEffect, useState } from 'react';
import {
  Button,
  Container,
  Heading,
  Icon,
  Table,
} from 'react-bulma-components';
import { getAllRooms } from '../../api/rooms/getAllRooms';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { type Room } from '../../types/roomsResponce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faPeopleRoof,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ModalError } from '../../components/ModalError';
import { ModalLoader } from '../../components/ModalLoader';
import { createRoom } from '../../api/rooms/createRoom';
import { type CustomAxiosError } from '../../types/customAxiosError';
import { ModalSuccess } from '../../components/ModalSuccess';
import { deleteRoom } from '../../api/rooms/deletRoom';
import { ModalRoomNameChange } from '../../components/ModalRoomNameChange';
import { renameRoom } from '../../api/rooms/renameRoom';
import { ModalChoice } from '../../components/ModalChoice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import * as chatRoomAction from '../../features/chatRooms';

export const ChatRoomsPage = () => {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state) => state.chatRooms);

  const [roomsApp, setRoomsApp] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [loadingApp, setLoadingApp] = useState<boolean>(false);
  const [errorApp, setErrorApp] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [successCreate, setSuccessCreate] = useState('');
  const [nameChangeVisible, setNameChangeVisible] = useState(false);
  const [nameChangeSelected, setNameChangeSelected] = useState('');
  const [choiceDeleteVisible, setChoiceDeleteVisible] = useState(false);
  const [choiceDeleteSelectedId, setChoiceDeleteSelectedId] = useState<
    number | undefined
  >();

  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRoomsApp(rooms);
  }, [rooms]);

  function fetchRooms() {
    setLoadingApp(true);

    getAllRooms()
      .then((res) => {
        dispatch(chatRoomAction.actions.setChatRooms(res.data));
      })
      .catch((err) => {
        setErrorApp(handleErrors(err as AxiosError | Error));
      })
      .finally(() => setLoadingApp(false));
  }

  function handleCreateRoom() {
    setLoadingApp(true);

    createRoom(newRoomName)
      .then((res) => {
        dispatch(chatRoomAction.actions.setChatRooms([...rooms, res.data]));
        setNewRoomName('');
        setErrorApp('');
        setSuccess('Room created successfully');
      })
      .catch((err) => {
        setErrorApp(handleErrors(err as AxiosError | Error));
      })
      .finally(() => setLoadingApp(false));
  }

  function handleErrors(error: AxiosError | Error) {
    if (error instanceof AxiosError) {
      const axiosError = error as CustomAxiosError;
      if (error.status === 422) {
        if (axiosError.response?.data?.errors) {
          const errors = axiosError.response?.data?.errors;

          return Object.values(errors).join(', ');
        } else {
          return `An unexpected error occurred: ${error.message}`;
        }
      } else if (error.status === 400) {
        const errMsg: string = error?.response?.data?.message;
        return errMsg;
      } else {
        return `An unexpected error occurred: ${error?.message}`;
      }
    } else if (error instanceof Error) {
      return `An unexpected error occurred: ${error?.message}`;
    } else {
      return `An unexpected error occurred: unknown`;
    }
  }

  function handleDeleteRoom(id: number) {
    setLoadingApp(true);
    deleteRoom(id)
      .then(() => {
        setRoomsApp((prev) => {
          const newRooms = prev.filter((room) => room.id !== id);
          dispatch(chatRoomAction.actions.setChatRooms(newRooms));
          return newRooms;
        });

        setSuccess('Room deleted successfully');
      })
      .catch((err) => {
        setErrorApp(handleErrors(err as AxiosError | Error));
      })
      .finally(() => setLoadingApp(false));
  }

  function handleRename(result: string) {
    setNameChangeVisible(false);
    const room = roomsApp.find((room) => room.name === nameChangeSelected);

    if (room) {
      setLoadingApp(true);

      renameRoom(room.id, result)
        .then(() => {
          setSuccess(`Succesfully renamed room to ${result}.`);
          fetchRooms();
        })
        .catch((err: AxiosError | Error) => {
          setErrorApp(handleErrors(err));
        })
        .finally(() => {
          setLoadingApp(false);
        });
    } else {
      setErrorApp('Unexpected Error Occured');
    }

    setNameChangeSelected('');
  }

  function handleDeleteChoice(result: boolean) {
    setChoiceDeleteVisible(false);

    if (result && choiceDeleteSelectedId) {
      handleDeleteRoom(choiceDeleteSelectedId);
    }

    setChoiceDeleteSelectedId(undefined);
  }

  return (
    <>
      <ModalLoader isActive={!!loadingApp} />
      <ModalSuccess
        title="Success"
        body={success}
        isActive={!!success}
        onClose={() => {
          setSuccess('');
        }}
      />
      <ModalSuccess
        title="Success"
        body={successCreate}
        isActive={!!successCreate}
        onClose={() => {
          setSuccessCreate('');
          void navigate(`/room/${newRoomName}`);
        }}
      />
      <ModalChoice
        title="Confirm"
        body="Are you sure you wan to delete this chatroom"
        onAction={handleDeleteChoice}
        isActive={!!choiceDeleteVisible}
      />

      <ModalError
        title="Error"
        body={errorApp}
        isActive={!!errorApp}
        onClose={() => setErrorApp('')}
      />
      <Container className="is-flex is-flex-direction-column  ">
        <Heading textAlign={'center'}>Chat Rooms</Heading>

        <div className="field has-addons">
          <div className="control">
            <input
              className="input"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room Name"
              type="text"
            />
          </div>
          <div className="control">
            <button
              className="button is-info"
              onClick={() => {
                handleCreateRoom();
              }}
            >
              Create Room
            </button>
          </div>
        </div>

        <Table striped hoverable>
          <thead>
            <tr>
              <th>Room Name</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {roomsApp.map((room: Room) => {
              return (
                <tr key={room.id}>
                  <td style={{ height: '100%' }}>
                    <Link
                      to={`/room/${room.name}`}
                      className="is-flex is-align-items-center"
                      style={{ cursor: 'pointer' }}
                    >
                      <Icon size="large" className="mr-3">
                        <FontAwesomeIcon icon={faPeopleRoof} size="lg" />
                      </Icon>

                      <Heading subtitle className="m-0">
                        {room.name}
                      </Heading>
                    </Link>
                  </td>

                  <td style={{ height: '100%' }}>
                    <Button
                      color={'light'}
                      className="is-white ml-2"
                      onClick={() => {
                        setNameChangeSelected(room.name);
                        setNameChangeVisible(true);
                      }}
                    >
                      <Icon size="small" color={'primary'}>
                        <FontAwesomeIcon icon={faPen} />
                      </Icon>
                    </Button>

                    <Button
                      color={'light'}
                      className="is-white ml-2"
                      onClick={() => {
                        setChoiceDeleteSelectedId(room.id);
                        setChoiceDeleteVisible(true);
                      }}
                    >
                      <Icon size="small" color={'danger'} className="">
                        <FontAwesomeIcon icon={faTrash} />
                      </Icon>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Container>
      <ModalRoomNameChange
        oldName={nameChangeSelected}
        isActive={nameChangeVisible}
        onAction={handleRename}
        onClose={() => {
          setNameChangeVisible(false);
        }}
      />
    </>
  );
};
