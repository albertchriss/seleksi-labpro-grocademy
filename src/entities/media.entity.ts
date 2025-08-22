import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column({ unique: true }) // The name of the file in the MinIO bucket
  objectName: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;
}
