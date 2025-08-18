import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/auth/interceptors/response.interceptor';
import { Course } from 'src/entities/course.entity';

export class GetCoursesResponseDto {
  @ApiProperty({ type: [Course] })
  data: Course[];

  @ApiProperty()
  pagination: PaginationMetaDto;
}
