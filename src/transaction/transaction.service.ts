import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(
    userId: string,
    courseId: string,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      user: { id: userId },
      course: { id: courseId },
    });
    return await this.transactionRepository.save(transaction);
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['course', 'course.modules', 'userProgress'],
    });
  }

  async findPaginated(
    userId: string,
    q: string,
    page: number,
    limit: number,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.course', 'course')
      .leftJoinAndSelect('course.modules', 'modules')
      .leftJoinAndSelect('transaction.userProgress', 'userProgress')
      .where('transaction.userId = :userId', { userId })
      .andWhere('(course.title LIKE :q OR course.instructor LIKE :q)', {
        q: `%${q}%`,
      })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { transactions, total };
  }

  async findByUserIdAndCourseId(
    userId: string,
    courseId: string,
  ): Promise<Transaction | null> {
    return await this.transactionRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['course', 'course.modules', 'userProgress'],
    });
  }
}
