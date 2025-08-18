import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from 'src/auth/interceptors/response.interceptor';

export class ModuleListItemDto {
  @ApiProperty({ description: 'Module ID' })
  id: string;

  @ApiProperty({ description: 'Course ID' })
  course_id: string;

  @ApiProperty({ description: 'Module title' })
  title: string;

  @ApiProperty({ description: 'Module description' })
  description: string;

  @ApiProperty({ description: 'Module order' })
  order: number;

  @ApiProperty({
    description: 'PDF content file path',
    nullable: true,
  })
  pdf_content: string | null;

  @ApiProperty({
    description: 'Video content file path',
    nullable: true,
  })
  video_content: string | null;

  @ApiProperty({ description: 'Whether the module is completed by the user' })
  is_completed: boolean;

  @ApiProperty({ description: 'Module creation date' })
  created_at: string;

  @ApiProperty({ description: 'Module last update date' })
  updated_at: string;
}

export class GetModulesResponseDto {
  @ApiProperty({
    description: 'List of modules',
    type: [ModuleListItemDto],
    nullable: true,
  })
  data: ModuleListItemDto[] | null;

  @ApiProperty({ description: 'Pagination information' })
  pagination: PaginationMetaDto;
}
