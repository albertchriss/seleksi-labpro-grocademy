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
}
