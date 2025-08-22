import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('account')
export class Account {
  @PrimaryColumn()
  userId: string;

  @Unique(['email'])
  @Column()
  email: string;

  @Unique(['username'])
  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ default: Role.USER })
  role: Role;

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn({ name: 'userId' })
  user: User;
}
