import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Get()
  @Render('index')
  root() {
    return { message: 'Welcome to Grocademy!' };
  }
}
