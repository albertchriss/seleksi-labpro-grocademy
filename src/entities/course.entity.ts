import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { nanoid } from 'nanoid';
import { Module } from './module.entity';

@Entity('courses')
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  instructor: string;

  @Column('text', { array: true })
  topics: string[];

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  thumbnail_image: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.course)
  enrollments: Transaction[];

  @OneToMany(() => Module, (module) => module.course)
  modules: Module[];

  @BeforeInsert()
  generateId() {
    // Generate 8-character ID with alphanumeric chars
    this.id = nanoid(8);
  }
}
