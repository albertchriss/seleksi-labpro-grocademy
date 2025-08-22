import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipResponseInterceptor } from './auth/decorators/skip-response-interceptor.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Get()
  @Render('index')
  @SkipResponseInterceptor()
  root() {
    return { msg: 'Welcome to Grocademy!' };
  }

  @Get('login')
  @Render('login')
  @SkipResponseInterceptor()
  login() {
    return {};
  }

  @Get('courses')
  @Render('courses')
  @SkipResponseInterceptor()
  courses() {
    return { activeMenu: 'courses' };
  }

  @Get('my-courses')
  @Render('my-courses')
  @SkipResponseInterceptor()
  myCourses() {
    return { activeMenu: 'my-courses' };
  }

  @Get('courses/:courseId')
  @Render('course-detail')
  @SkipResponseInterceptor()
  courseDetail() {
    return {};
  }

  @Get('courses/:courseId/modules')
  @Render('course-modules')
  @SkipResponseInterceptor()
  courseModules() {
    return {};
  }

  @Get('dashboard')
  @Render('dashboard')
  @SkipResponseInterceptor()
  dashboard() {
    return {};
  }
}
