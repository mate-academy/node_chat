import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Room } from './Room';
import { User } from './User';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false, eager: true })
  author: Relation<User>;

  @ManyToOne(() => Room, (room) => room.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  room: Relation<Room>;
}
