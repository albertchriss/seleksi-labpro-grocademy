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
import {
  ReorderModulesDto,
  ReorderModulesResponseDto,
} from './dto/reorder-modules.dto';
import { GetCoursesResponseDto } from './dto/get-courses.dto';
import { BuyCourseResponseDto } from './dto/buy-course.dto';
import { CourseDetailResponseDto } from './dto/course-detail.dto';
import { UsersService } from 'src/users/users.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { GetMyCoursesResponseDto } from './dto/get-my-courses.dto';
import { EditCourseResponseDetailDto } from './dto/edit-course-response.dto';

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
    const courses = await this.courseRepository.find({
      where: [
        { title: Like(`%${query}%`) },
        { instructor: Like(`%${query}%`) },
      ],
      skip: skip,
      take: limit,
    });

    const numCourses = await this.courseRepository.count({
      where: [
        { title: Like(`%${query}%`) },
        { instructor: Like(`%${query}%`) },
      ],
    });

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(numCourses / limit),
      total_items: numCourses,
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
    const course = this.courseRepository.create({
      ...createCourseDto,
      thumbnail_image: thumbnailPath || null,
    });

    return await this.courseRepository.save(course);
  }

  async findOne(id: string): Promise<CourseDetailResponseDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const modules = await this.moduleRepository.count({
      where: { course: { id: course.id } },
    });

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      topics: course.topics,
      price: course.price,
      thumbnail_image: course.thumbnail_image,
      total_modules: modules,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString(),
    };
  }

  async editCourse(
    id: string,
    createCourseDto: CreateCourseDto,
  ): Promise<EditCourseResponseDetailDto> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    Object.assign(course, createCourseDto);
    await this.courseRepository.save(course);

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      topics: course.topics,
      price: course.price,
      thumbnail_image: course.thumbnail_image,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString(),
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

    const user = await this.userService.findUserByIdSimple(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Proceed with the purchase logic
    if (user.balance < course.price) {
      throw new BadRequestException('Insufficient balance to buy this course');
    }

    const prevTransaction =
      await this.transactionService.findByUserIdAndCourseId(user.id, courseId);
    if (prevTransaction) {
      throw new BadRequestException('User has already purchased this course');
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

  async getMyCourses(
    userId: string,
    q: string,
    page: number,
    limit: number,
  ): Promise<GetMyCoursesResponseDto> {
    const { transactions, total } = await this.transactionService.findPaginated(
      userId,
      q,
      page,
      limit,
    );

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
      purchased_at: trs.created_at,
    }));

    return {
      data: myCourses,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
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
      created_at: savedModule.created_at.toISOString(),
      updated_at: savedModule.updated_at.toISOString(),
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
    const skip = (page - 1) * limit;

    const modules = await this.moduleRepository.find({
      where: { course: { id: courseId } },
      order: { order: 'ASC' },
      relations: [
        'userProgress',
        'userProgress.transaction',
        'userProgress.transaction.user',
      ],
      skip: skip,
      take: limit,
    });

    const total = await this.moduleRepository.count({
      where: { course: { id: courseId } },
    });

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
      created_at: module.created_at.toISOString(),
      updated_at: module.updated_at.toISOString(),
    }));

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_items: total,
    };

    return {
      data: moduleData,
      pagination,
    };
  }

  async reorderModules(
    courseId: string,
    reorderModulesDto: ReorderModulesDto,
  ): Promise<ReorderModulesResponseDto> {
    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Validate order values are unique and form a permutation of 1 to N
    const orderValues = reorderModulesDto.module_order.map(
      (item) => item.order,
    );
    const moduleIds = reorderModulesDto.module_order.map((item) => item.id);
    const n = reorderModulesDto.module_order.length;

    // Check for unique order values
    const uniqueOrderValues = new Set(orderValues);
    if (uniqueOrderValues.size !== n) {
      throw new BadRequestException('Order values must be unique');
    }

    // Check for unique module IDs
    const uniqueModuleIds = new Set(moduleIds);
    if (uniqueModuleIds.size !== n) {
      throw new BadRequestException('Module IDs must be unique');
    }

    // Check if order values form a valid permutation of 1 to N
    const sortedOrderValues = [...orderValues].sort((a, b) => a - b);
    const expectedValues = Array.from({ length: n }, (_, i) => i + 1);

    if (JSON.stringify(sortedOrderValues) !== JSON.stringify(expectedValues)) {
      throw new BadRequestException(
        `Order values must be a permutation of 1 to ${n}`,
      );
    }

    // Update each module's order
    const updatePromises = reorderModulesDto.module_order.map(async (item) => {
      const module = await this.moduleRepository.findOne({
        where: { id: item.id, course: { id: courseId } },
      });

      if (!module) {
        throw new NotFoundException(
          `Module with id ${item.id} not found in this course`,
        );
      }

      return this.moduleRepository.update(item.id, { order: item.order });
    });

    await Promise.all(updatePromises);

    return {
      module_order: reorderModulesDto.module_order,
    };
  }
}
