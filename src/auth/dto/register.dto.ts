import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

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
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
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
