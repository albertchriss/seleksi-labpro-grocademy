import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/auth/interceptors/response.interceptor';

export class MyCourse {
  @ApiProperty({ description: 'Course ID' })
  id: string;

  @ApiProperty({ description: 'Course Title' })
  title: string;

  @ApiProperty({ description: 'Course Instructor' })
  instructor: string;

  @ApiProperty({ description: 'Course Topics' })
  topics: string[];

  @ApiProperty({ description: 'Course Thumbnail Image' })
  thumbnail_image: string | null;

  @ApiProperty({ description: 'User Course Progress' })
  progress_percentage: number;

  @ApiProperty({ description: 'Course Purchase Date' })
  purchased_at: Date;
}

export class GetMyCoursesResponseDto {
  @ApiProperty({ type: [MyCourse] })
  data: MyCourse[];

  @ApiProperty()
  pagination: PaginationMetaDto;
}
