import { ApiProperty } from '@nestjs/swagger';

export class CourseProgressDto {
  @ApiProperty({ description: 'Total number of modules in the course' })
  total_modules: number;

  @ApiProperty({ description: 'Number of completed modules' })
  completed_modules: number;

  @ApiProperty({ description: 'Completion percentage' })
  percentage: number;
}

export class CompleteModuleResponseDto {
  @ApiProperty({ description: 'Module ID' })
  module_id: string;

  @ApiProperty({ description: 'Whether the module is completed' })
  is_completed: boolean;

  @ApiProperty({ description: 'Course progress information' })
  course_progress: CourseProgressDto;

  @ApiProperty({
    description: 'Certificate URL (null for now)',
    nullable: true,
  })
  certificate_url: string | null;
}
