import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './interfaces/auth.interface';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { Auth } from './decorators/auth.decorator';
import { SelfDto } from './dto/self.dto';
import { Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  login(
    @Request() req: AuthenticatedRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginDto: LoginDto,
  ): LoginResponseDto {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Auth()
  @Get('self')
  @ApiOperation({ summary: 'Get user profile' })
  getSelf(@Request() req: AuthenticatedRequest): SelfDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at, updated_at, profile_pic, ...userWithoutTimestamps } =
      req.user;
    return userWithoutTimestamps as SelfDto;
  }

  // New Google Auth Routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Request() req) {
    // Guards redirects
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { token } = await this.authService.googleLogin(req);

    res.render('auth-callback', { token });
  }
}
