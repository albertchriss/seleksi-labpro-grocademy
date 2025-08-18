import {
  BeforeInsert,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { nanoid } from 'nanoid';
import { UserProgress } from './user-progress.entity';

@Entity('transaction')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserProgress, (userProgress) => userProgress.transaction, {
    onDelete: 'CASCADE',
  })
  userProgress: UserProgress[];

  @BeforeInsert()
  generateId() {
    // Generate 8-character ID with alphanumeric chars
    this.id = nanoid(8);
  }
}
