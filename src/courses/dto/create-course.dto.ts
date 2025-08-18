import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumberString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  instructor: string;

  @IsString()
  topics: string;

  @ApiProperty()
  @IsNumberString()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  thumbnail_image?: string;
}
