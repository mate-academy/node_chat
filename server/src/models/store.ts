import EventEmitter from 'events';
import type { Room } from './types.js';

export const rooms: Record<string, Room> = {
  general: { name: 'General', messages: [] },
  random: { name: 'Random', messages: [] },
};

export const users: string[] = [];
export const emitter = new EventEmitter();
