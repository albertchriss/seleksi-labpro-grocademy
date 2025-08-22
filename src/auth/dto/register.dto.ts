import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    example: 'johndoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'johndoe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  confirm_password: string;
}

export class RegisterResponseDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;
}
