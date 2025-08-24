import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseInterceptors,
  Query,
  Param,
  Delete,
  Request,
  Put,
  UploadedFile,
  UploadedFiles,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { AdminAuth, Auth } from 'src/auth/decorators/auth.decorator';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModuleResponseDto } from './dto/module-response.dto';
import { GetModulesResponseDto } from './dto/get-modules.dto';
import {
  ReorderModulesDto,
  ReorderModulesResponseDto,
} from './dto/reorder-modules.dto';
import { GetCoursesResponseDto } from './dto/get-courses.dto';
import { BuyCourseResponseDto } from './dto/buy-course.dto';
import { CourseDetailResponseDto } from './dto/course-detail.dto';
import { AuthenticatedRequest } from 'src/auth/interfaces/auth.interface';
import { GetMyCoursesResponseDto } from './dto/get-my-courses.dto';
import { EditCourseResponseDetailDto } from './dto/edit-course-response.dto';
import { SkipResponseInterceptor } from 'src/auth/decorators/skip-response-interceptor.decorator';

@ApiTags('courses')
@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Auth()
  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<GetCoursesResponseDto> {
    if (!page) page = 1;
    if (page < 1) page = 1;
    if (!limit) limit = 15;
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;
    if (!q) q = '';

    return this.coursesService.findPaginated(q, page, limit);
  }

  @Get('subscribe')
  @Auth()
  async subscribe() {
    await this.coursesService.waitForUpdate();
    return { message: 'Data has been updated.' };
  }

  @Auth()
  @Get('my-courses')
  @ApiOperation({ summary: 'Get my courses' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMyCourses(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetMyCoursesResponseDto> {
    if (!page) page = 1;
    if (page < 1) page = 1;
    if (!limit) limit = 15;
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;
    if (!q) q = '';
    return this.coursesService.getMyCourses(req.user.id, q, page, limit);
  }

  @Auth()
  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string): Promise<CourseDetailResponseDto> {
    return this.coursesService.findOne(id);
  }

  @AdminAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update course by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        instructor: { type: 'string' },
        topics: {
          type: 'array',
          items: { type: 'string' },
        },
        price: { type: 'number' },
        thumbnail_image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'instructor', 'topics', 'price'],
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail_image'))
  update(
    @Param('id') id: string,
    @Body() body: CreateCourseDto,
    @UploadedFile() thumbnailImageFile: Express.Multer.File,
  ): Promise<EditCourseResponseDetailDto> {
    return this.coursesService.editCourse(id, body, thumbnailImageFile);
  }

  @AdminAuth()
  @Post()
  @ApiOperation({ summary: 'Create new course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        instructor: { type: 'string' },
        topics: {
          type: 'array',
          items: { type: 'string' },
        },
        price: { type: 'number' },
        thumbnail_image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'instructor', 'topics', 'price'],
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail_image'))
  async createCourse(
    @Body() body: CreateCourseDto,
    @UploadedFile() thumbnailImageFile: Express.Multer.File,
  ): Promise<EditCourseResponseDetailDto> {
    const createdCourse = await this.coursesService.create(
      body,
      thumbnailImageFile,
    );

    return {
      id: createdCourse.id,
      title: createdCourse.title,
      description: createdCourse.description,
      instructor: createdCourse.instructor,
      topics: createdCourse.topics,
      price: createdCourse.price,
      thumbnail_image: createdCourse.thumbnail_image,
      created_at: createdCourse.created_at.toISOString(),
      updated_at: createdCourse.updated_at.toISOString(),
    };
  }

  @Auth()
  @Post(':id/buy')
  @ApiOperation({ summary: 'Buy a course' })
  buyCourse(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BuyCourseResponseDto> {
    return this.coursesService.buyCourse(id, req.user.id);
  }

  @AdminAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  async deleteCourse(@Param('id') id: string): Promise<void> {
    await this.coursesService.delete(id);
  }

  @Auth()
  @Get(':courseId/modules')
  @ApiOperation({ summary: 'Get modules for a course' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 15, max: 50)',
  })
  async getModules(
    @Param('courseId') courseId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<GetModulesResponseDto> {
    if (!page) page = 1;
    if (page < 1) page = 1;
    if (!limit) limit = 15;
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;

    return this.coursesService.getModulesByCourse(
      courseId,
      req.user.id,
      page,
      limit,
    );
  }

  @AdminAuth()
  @Post(':courseId/modules')
  @ApiOperation({ summary: 'Create a new module for a course' })
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
  async createModule(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @UploadedFiles()
    files: {
      pdf_content?: Express.Multer.File[];
      video_content?: Express.Multer.File[];
    },
  ): Promise<ModuleResponseDto> {
    const pdfFile = files.pdf_content?.[0];
    const videoFile = files.video_content?.[0];
    return this.coursesService.createModule(courseId, createModuleDto, {
      pdf_content: pdfFile,
      video_content: videoFile,
    });
  }

  @AdminAuth()
  @Patch(':courseId/modules/reorder')
  @ApiOperation({ summary: 'Reorder modules in a course' })
  async reorderModules(
    @Param('courseId') courseId: string,
    @Body() reorderModulesDto: ReorderModulesDto,
  ): Promise<ReorderModulesResponseDto> {
    return this.coursesService.reorderModules(courseId, reorderModulesDto);
  }

  @Auth()
  @SkipResponseInterceptor()
  @Get(':id/certificate')
  async downloadCertificate(
    @Param('id') courseId: string,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const userId = req.user.id;
    const pdfBuffer = await this.coursesService.generateCertificate(
      courseId,
      userId,
    );

    const filename = `Certificate-Grocademy.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return new StreamableFile(pdfBuffer);
  }
}
