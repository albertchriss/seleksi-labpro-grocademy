/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { createDatabaseConfig } from '../database.config';
import { User } from '../../entities/user.entity';
import { Account } from '../../entities/account.entity';
import { Course } from '../../entities/course.entity';
import { UserProgress } from '../../entities/user-progress.entity';
import { Module } from '../../entities/module.entity';
import { Transaction } from '../../entities/transaction.entity';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource(createDatabaseConfig());

async function seed() {
  await AppDataSource.initialize();
  console.log('Data Source has been initialized!');

  const userRepository = AppDataSource.getRepository(User);
  const accountRepository = AppDataSource.getRepository(Account);
  const courseRepository = AppDataSource.getRepository(Course);
  const moduleRepository = AppDataSource.getRepository(Module);
  const transactionRepository = AppDataSource.getRepository(Transaction);
  const userProgressRepository = AppDataSource.getRepository(UserProgress);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const confirm = await new Promise<boolean>((resolve) => {
    rl.question(
      'This will DELETE ALL DATA in the database. Are you sure? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === 'yes');
      },
    );
  });

  if (!confirm) {
    console.log('Seeding cancelled.');
    await AppDataSource.destroy();
    process.exit(0);
  }

  // Delete all data in correct order (respecting FK constraints)
  await userProgressRepository.deleteAll();
  await transactionRepository.deleteAll();
  await moduleRepository.deleteAll();
  await courseRepository.deleteAll();
  await accountRepository.deleteAll();
  await userRepository.deleteAll();

  // --- Helper to read CSV ---
  const readCsv = <T>(filePath: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream: fs.ReadStream = fs.createReadStream(filePath);
      const parser: NodeJS.ReadWriteStream = csv();
      stream
        .pipe(parser)
        .on('data', (data: T) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error: Error) => reject(error));
    });
  };

  // --- Seed Users ---
  const users = await readCsv<any>('src/database/seed/csv/users.csv');
  await userRepository.save(users);

  // --- Seed Accounts ---
  const accounts = await readCsv<any>('src/database/seed/csv/accounts.csv');
  // await accountRepository.save(accounts);
  for (const accountData of accounts) {
    const hashedPass = await bcrypt.hash(accountData.password, 10);
    const account = accountRepository.create({
      ...accountData,
      password: hashedPass,
    });
    await accountRepository.save(account);
  }

  // --- Seed Courses ---
  const courses = await readCsv<any>('src/database/seed/csv/courses.csv');
  await courseRepository.save(courses);

  // --- Seed Modules ---
  const modules = await readCsv<any>('src/database/seed/csv/modules.csv');
  for (const moduleData of modules) {
    const course = await courseRepository.findOneBy({
      id: moduleData.courseId,
    });
    if (course) {
      const module = moduleRepository.create({ ...moduleData, course });
      await moduleRepository.save(module);
    }
  }

  // --- Seed Transactions ---
  const transactions = await readCsv<any>(
    'src/database/seed/csv/transactions.csv',
  );
  for (const transactionData of transactions) {
    const user = await userRepository.findOneBy({ id: transactionData.userId });
    const course = await courseRepository.findOneBy({
      id: transactionData.courseId,
    });
    if (user && course) {
      const transaction = transactionRepository.create({
        ...transactionData,
        user,
        course,
      });
      await transactionRepository.save(transaction);
    }
  }

  // --- Seed User Progress ---
  const userProgresses = await readCsv<any>(
    'src/database/seed/csv/user_progress.csv',
  );
  for (const progressData of userProgresses) {
    const transaction = await transactionRepository.findOneBy({
      id: progressData.transactionId,
    });
    const module = await moduleRepository.findOneBy({
      id: progressData.moduleId,
    });
    if (transaction && module) {
      const userProgress = userProgressRepository.create({
        ...progressData,
        transaction,
        module,
      });
      await userProgressRepository.save(userProgress);
    }
  }

  await AppDataSource.destroy();
  console.log('Database seeded successfully!');
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
