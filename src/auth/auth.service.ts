import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersServie: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, pass: string): Promise<User | null> {
    const [account, user] = await Promise.all([
      this.usersServie.findAccountByIdentifier(identifier),
      this.usersServie.findUserByIdentifier(identifier),
    ]);

    if (!account || !user) {
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

    const existingEmail = await this.usersServie.findUserByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername =
      await this.usersServie.findUserByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersServie.create(
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
}
