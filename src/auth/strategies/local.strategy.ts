import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'identifier', passReqToCallback: true });
  }

  async validate(
    req: Request,
    identifier: string,
    password: string,
  ): Promise<User> {
    const requestOrigin = req.headers.origin;
    const user = await this.authService.validateUser(
      identifier,
      password,
      requestOrigin,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
