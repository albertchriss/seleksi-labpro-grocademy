import { nanoid } from 'nanoid';
import {
  BeforeInsert,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Module } from './module.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.userProgress, {
    onDelete: 'CASCADE',
  })
  transaction: Transaction;

  @ManyToOne(() => Module, (module) => module.userProgress, {
    onDelete: 'CASCADE',
  })
  module: Module;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    // Generate 8-character ID with alphanumeric chars
    this.id = nanoid(8);
  }
}
