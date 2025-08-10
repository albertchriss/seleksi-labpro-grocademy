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
import { UserCourse } from './user-course.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Unique(['email'])
  email: string;

  @Column()
  @Unique(['username'])
  username: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({
    default: 0,
  })
  balance: number;

  @Column({ nullable: true })
  profile_pic: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Account, (account) => account.user)
  account: Account;

  @OneToMany(() => UserCourse, (userCourse) => userCourse.user)
  enrollments: UserCourse[];
}
