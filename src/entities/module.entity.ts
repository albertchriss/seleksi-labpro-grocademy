import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { nanoid } from 'nanoid';
import { UserProgress } from './user-progress.entity';

@Entity('modules')
export class Module {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  order: number;

  @Column({ nullable: true })
  pdf_content: string | null;

  @Column({ nullable: true })
  video_content: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.modules, { onDelete: 'CASCADE' })
  course: Course;

  @OneToMany(() => UserProgress, (userProgress) => userProgress.module)
  userProgress: UserProgress[];

  @BeforeInsert()
  generateId() {
    this.id = nanoid(8);
  }
}
