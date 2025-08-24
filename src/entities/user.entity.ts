import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Unique(['email'])
  email: string;

  @Column({ nullable: true })
  @Unique(['username'])
  username: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  profile_pic: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Account, (account) => account.user)
  account: Account;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  enrollments: Transaction[];
}
