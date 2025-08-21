import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../entities/module.entity';
import { UserProgress } from '../entities/user-progress.entity';
import { Transaction } from '../entities/transaction.entity';
import { ModuleDetailResponseDto } from './dto/module-detail.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CompleteModuleResponseDto } from './dto/complete-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findOne(
    id: string,
    userId: string,
  ): Promise<ModuleDetailResponseDto | null> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: [
        'course',
        'userProgress',
        'userProgress.transaction',
        'userProgress.transaction.user',
      ],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const isCompleted = module.userProgress.some(
      (progress) => progress.transaction.user.id === userId,
    );

    return {
      id: module.id,
      course_id: module.course.id,
      title: module.title,
      description: module.description,
      order: module.order,
      pdf_content: module.pdf_content,
      video_content: module.video_content,
      is_completed: isCompleted,
      created_at: module.created_at.toISOString(),
      updated_at: module.updated_at.toISOString(),
    };
  }

  async update(
    id: string,
    updateModuleDto: UpdateModuleDto,
    userId: string,
    pdfPath?: string | null,
    videoPath?: string | null,
  ): Promise<ModuleDetailResponseDto> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Update the module
    await this.moduleRepository.update(id, {
      title: updateModuleDto.title,
      description: updateModuleDto.description,
      pdf_content: pdfPath !== undefined ? pdfPath : module.pdf_content,
      video_content: videoPath !== undefined ? videoPath : module.video_content,
    });

    // Fetch the updated module with all relations
    const updatedModule = await this.moduleRepository.findOne({
      where: { id },
      relations: [
        'course',
        'userProgress',
        'userProgress.transaction',
        'userProgress.transaction.user',
      ],
    });

    const isCompleted = updatedModule.userProgress.some(
      (progress) => progress.transaction.user.id === userId,
    );

    return {
      id: updatedModule.id,
      course_id: updatedModule.course.id,
      title: updatedModule.title,
      description: updatedModule.description,
      order: updatedModule.order,
      pdf_content: updatedModule.pdf_content,
      video_content: updatedModule.video_content,
      is_completed: isCompleted,
      created_at: updatedModule.created_at.toISOString(),
      updated_at: updatedModule.updated_at.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    const module = await this.moduleRepository.findOne({
      where: { id },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    await this.moduleRepository.delete(id);
  }

  async completeModule(
    id: string,
    userId: string,
  ): Promise<CompleteModuleResponseDto | null> {
    // Find the module
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['course', 'course.modules'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Find user's transaction for this course to verify enrollment
    const transaction = await this.transactionRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: module.course.id },
      },
      relations: ['user', 'course', 'userProgress'],
    });

    if (!transaction) {
      throw new NotFoundException('User is not enrolled in this course');
    }

    // Check if user progress already exists for this module
    let userProgress = await this.userProgressRepository.findOne({
      where: {
        module: { id },
        transaction: { id: transaction.id },
      },
    });

    // If not exists, create new progress entry
    if (!userProgress) {
      userProgress = this.userProgressRepository.create({
        module: module,
        transaction: transaction,
      });
      await this.userProgressRepository.save(userProgress);
    }

    // Calculate course progress
    const totalModules = module.course.modules.length;
    const completedModulesProgress = await this.userProgressRepository.find({
      where: {
        transaction: { id: transaction.id },
      },
      relations: ['module'],
    });

    const completedModules = completedModulesProgress.length;
    const percentage =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    return {
      module_id: id,
      is_completed: true,
      course_progress: {
        total_modules: totalModules,
        completed_modules: completedModules,
        percentage: percentage,
      },
      certificate_url: null, // Always null for now as requested
    };
  }
}
