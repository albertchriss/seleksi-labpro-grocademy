import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Request,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ModuleDetailResponseDto } from './dto/module-detail.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CompleteModuleResponseDto } from './dto/complete-module.dto';
import { AuthenticatedRequest } from 'src/auth/interfaces/auth.interface';

@ApiTags('modules')
@Controller('api/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Auth()
  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ModuleDetailResponseDto | null> {
    return this.modulesService.findOne(id, req.user.id);
  }

  @Auth()
  @Put(':id')
  @ApiOperation({ summary: 'Update module by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        pdf_content: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
        video_content: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
      required: ['title', 'description'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'pdf_content', maxCount: 1 },
        { name: 'video_content', maxCount: 1 },
      ],
      {
        fileFilter: (req, file, callback) => {
          if (file.fieldname === 'pdf_content') {
            if (file.mimetype === 'application/pdf') {
              callback(null, true);
            } else {
              callback(
                new Error('Only PDF files are allowed for pdf_content'),
                false,
              );
            }
          } else if (file.fieldname === 'video_content') {
            if (file.mimetype.startsWith('video/')) {
              callback(null, true);
            } else {
              callback(
                new Error('Only video files are allowed for video_content'),
                false,
              );
            }
          } else {
            callback(null, true);
          }
        },
      },
    ),
  )
  async updateModule(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @Request() req: AuthenticatedRequest,
    @UploadedFiles()
    files: {
      pdf_content?: Express.Multer.File[];
      video_content?: Express.Multer.File[];
    },
  ): Promise<ModuleDetailResponseDto> {
    const pdfFile = files?.pdf_content?.[0];
    const videoFile = files?.video_content?.[0];

    return this.modulesService.update(
      id,
      updateModuleDto,
      req.user.id,
      pdfFile?.filename,
      videoFile?.filename,
    );
  }

  @Auth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete module by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModule(@Param('id') id: string): Promise<void> {
    await this.modulesService.delete(id);
  }

  @Auth()
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark module as completed' })
  async completeModule(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<CompleteModuleResponseDto | null> {
    return this.modulesService.completeModule(id, req.user.id);
  }
}
