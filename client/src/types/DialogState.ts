import type { Room } from "./Room";

export type DialogState =
  | { type: "create"; room?: never } // Для 'create' комната не нужна
  | { type: "rename"; room: Room } // Для 'rename' комната обязательна
  | { type: "delete"; room: Room } // Для 'delete' комната обязательна
  | null;   