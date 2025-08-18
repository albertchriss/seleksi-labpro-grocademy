import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { Module } from '../entities/module.entity';
import { Like, Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { ModuleResponseDto } from './dto/module-response.dto';
import { GetModulesResponseDto } from './dto/get-modules.dto';
import { GetCoursesResponseDto } from './dto/get-courses.dto';
import { BuyCourseResponseDto } from './dto/buy-course.dto';
import { CourseDetailResponseDto } from './dto/course-detail.dto';
import { UsersService } from 'src/users/users.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { GetMyCoursesResponseDto } from './dto/get-my-courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    private userService: UsersService,
    private transactionService: TransactionService,
  ) {}

  findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  async findPaginated(
    query: string,
    page: number,
    limit: number,
  ): Promise<GetCoursesResponseDto> {
    const skip = (page - 1) * limit;
    const allCourses = await this.courseRepository.find({
      where: { title: Like(`%${query}%`) },
    });

    const courses = allCourses.slice(skip, skip + limit);

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(allCourses.length / limit),
      total_items: allCourses.length,
    };

    return {
      data: courses,
      pagination: pagination,
    };
  }

  async create(
    createCourseDto: CreateCourseDto,
    thumbnailPath?: string,
  ): Promise<Course> {
    const { topics } = createCourseDto;
    const topicArray = topics.split(',').map((topic) => topic.trim());
    const course = this.courseRepository.create({
      ...createCourseDto,
      topics: topicArray,
      thumbnail_image: thumbnailPath || null,
    });

    return await this.courseRepository.save(course);
  }

  async findOne(id: string): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      topics: course.topics,
      price: course.price,
      thumbnail_image: course.thumbnail_image,
      total_modules: 0,
      created_at: course.createdAt.toISOString(),
      updated_at: course.updatedAt.toISOString(),
    };
  }

  async buyCourse(
    courseId: string,
    userId: string,
  ): Promise<BuyCourseResponseDto> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Proceed with the purchase logic
    if (user.balance < course.price) {
      throw new BadRequestException('Insufficient balance to buy this course');
    }

    user.balance -= course.price;
    await this.userService.editUser(user.id, user);

    const transaction = await this.transactionService.createTransaction(
      user.id,
      courseId,
    );

    return {
      course_id: course.id,
      user_balance: user.balance,
      transaction_id: transaction.id,
    };
  }

  async delete(id: string): Promise<void> {
    await this.courseRepository.delete(id);
  }

  async getMyCourses(userId: string): Promise<GetMyCoursesResponseDto> {
    const transactions = await this.transactionService.findByUserId(userId);

    const myCourses = transactions.map((trs) => ({
      id: trs.course.id,
      title: trs.course.title,
      instructor: trs.course.instructor,
      topics: trs.course.topics,
      price: trs.course.price,
      thumbnail_image: trs.course.thumbnail_image,
      progress_percentage: trs.course.modules.length
        ? (trs.userProgress.length / trs.course.modules.length) * 100
        : 0,
      purchased_at: trs.createdAt,
    }));

    return {
      data: myCourses,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: myCourses.length,
      },
    };
  }

  async createModule(
    courseId: string,
    createModuleDto: CreateModuleDto,
    pdfPath?: string | null,
    videoPath?: string | null,
  ): Promise<ModuleResponseDto> {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['modules'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Calculate the next order number
    const nextOrder = course.modules.length + 1;

    // Create the module
    const module = this.moduleRepository.create({
      title: createModuleDto.title,
      description: createModuleDto.description,
      order: nextOrder,
      pdf_content: pdfPath ?? null,
      video_content: videoPath ?? null,
      course: course,
    });

    const savedModule = await this.moduleRepository.save(module);

    return {
      id: savedModule.id,
      course_id: courseId,
      title: savedModule.title,
      description: savedModule.description,
      order: savedModule.order,
      pdf_content: savedModule.pdf_content,
      video_content: savedModule.video_content,
      created_at: savedModule.createdAt.toISOString(),
      updated_at: savedModule.updatedAt.toISOString(),
    };
  }

  async getModulesByCourse(
    courseId: string,
    userId: string,
    page: number = 1,
    limit: number = 15,
  ): Promise<GetModulesResponseDto> {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get all modules for the course
    const allModules = await this.moduleRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
      relations: [
        'userProgress',
        'userProgress.transaction',
        'userProgress.transaction.user',
      ],
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const modules = allModules.slice(skip, skip + limit);

    // Map modules to response format
    const moduleData = modules.map((module) => ({
      id: module.id,
      course_id: courseId,
      title: module.title,
      description: module.description,
      order: module.order,
      pdf_content: module.pdf_content,
      video_content: module.video_content,
      is_completed: module.userProgress.some(
        (progress) => progress.transaction.user.id === userId,
      ),
      created_at: module.createdAt.toISOString(),
      updated_at: module.updatedAt.toISOString(),
    }));

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(allModules.length / limit),
      total_items: allModules.length,
    };

    return {
      data: moduleData,
      pagination,
    };
  }
}
