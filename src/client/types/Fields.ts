import {
  validateRoomId,
  validateRoomname,
  validateUsername,
} from '../../utils/validators';

export type InputType = 'text';

export type FieldConfig = {
  type: InputType;
  initialValue?: string;
  label: string;
};

export type InputConfig = {
  [key: string]: {
    type: InputType;
    validator: (value: string) => string | undefined;
    placeholder: string;
    icon: string;
  };
};

export const inputParams: InputConfig = {
  username: {
    type: 'text',
    validator: validateUsername,
    placeholder: 'Alyona',
    icon: 'fa-solid fa-user',
  },

  roomId: {
    type: 'text',
    validator: validateRoomId,
    placeholder: 'qwe234...',
    icon: 'fa-solid fa-key',
  },

  roomName: {
    type: 'text',
    validator: validateRoomname,
    placeholder: 'Room123',
    icon: 'fa-solid fa-user-group',
  },
};

type FieldNames = typeof inputParams;

export type Fields = Record<keyof FieldNames, FieldConfig>;

export type FormTitle = { text: string; size?: number };
