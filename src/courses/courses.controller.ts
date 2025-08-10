import { Controller, Get } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from '../entities/course.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Auth()
  @Get()
  findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }
}
