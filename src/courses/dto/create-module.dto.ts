import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({ description: 'Module title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Module description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'PDF content file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  pdf_content?: Express.Multer.File;

  @ApiProperty({
    description: 'Video content file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  video_content?: Express.Multer.File;
}
