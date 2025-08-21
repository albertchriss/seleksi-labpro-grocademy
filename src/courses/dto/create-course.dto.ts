import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumberString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

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

  @ApiProperty({
    type: [String],
    description: 'List of topics',
    example: ['nestjs', 'backend', 'typescript'],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @Type(() => String)
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  topics: string[];

  @ApiProperty()
  @IsNumberString()
  price: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  thumbnail_image?: Express.Multer.File;
}
