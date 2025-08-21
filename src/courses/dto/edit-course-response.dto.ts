import { ApiProperty } from '@nestjs/swagger';

export class EditCourseResponseDetailDto {
  @ApiProperty({ description: 'Course ID' })
  id: string;

  @ApiProperty({ description: 'Course title' })
  title: string;

  @ApiProperty({ description: 'Course description' })
  description: string;

  @ApiProperty({ description: 'Instructor name' })
  instructor: string;

  @ApiProperty({ description: 'Course topics', type: [String] })
  topics: string[];

  @ApiProperty({ description: 'Course price' })
  price: number;

  @ApiProperty({
    description: 'Course thumbnail image URL',
    nullable: true,
  })
  thumbnail_image: string | null;

  @ApiProperty({ description: 'Course creation date' })
  created_at: string;

  @ApiProperty({ description: 'Course last update date' })
  updated_at: string;
}
