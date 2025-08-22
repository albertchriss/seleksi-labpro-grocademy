import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<User | null> {
    const [account, user] = await Promise.all([
      this.usersService.findAccountByIdentifier(identifier),
      this.usersService.findUserByIdentifier(identifier),
    ]);

    if (!account || !user) {
      return null;
    }

    if (!account.password) {
      return null;
    }

    if (!(await bcrypt.compare(pass, account.password))) {
      return null;
    }

    return user;
  }

  login(user: User): LoginResponseDto {
    const payload = { email: user.email, sub: user.id };
    return {
      username: user.username,
      token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const {
      username,
      email,
      password,
      confirm_password,
      first_name,
      last_name,
    } = registerDto;

    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingEmail = await this.usersService.findUserByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername =
      await this.usersService.findUserByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(
      {
        username,
        email,
        first_name,
        last_name,
      },
      {
        username,
        email,
        password: hashedPassword,
      },
    );
    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }

  // New Google Login Method
  async googleLogin(req: AuthenticatedRequest): Promise<LoginResponseDto> {
    if (!req.user) {
      throw new BadRequestException('No user from google');
    }

    const { email, first_name, last_name, profile_pic } = req.user;

    try {
      let user = await this.usersService.findUserByEmail(email);

      if (!user) {
        // If user doesn't exist, create a new one
        const username = email.split('@')[0]; // Or generate a unique username
        user = await this.usersService.create(
          {
            email,
            first_name,
            last_name,
            profile_pic,
            // profile_pic: picture,
          },
          {
            email,
            username,
          },
        );
      }

      // Login the user and return the JWT token
      return this.login(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Failed to process Google login',
          error.message,
        );
      }
      throw new InternalServerErrorException('Failed to process Google login');
    }
  }
}
