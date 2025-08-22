import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Password', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}

export class UpdateUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'First name' })
  first_name: string;

  @ApiProperty({ description: 'Last name' })
  last_name: string;

  @ApiProperty({ description: 'User balance' })
  balance: number;
}
