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
}
