import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Account, Role } from 'src/entities/account.entity';
import { User } from 'src/entities/user.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { DataSource, Repository, Like } from 'typeorm';
import { GetUsersResponseDto } from './dto/get-users.dto';
import {
  UpdateBalanceDto,
  UpdateBalanceResponseDto,
} from './dto/update-balance.dto';
import { GetUserResponseDto } from './dto/get-user.dto';
import { UpdateUserDto, UpdateUserResponseDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  findAccountByEmail(email: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { email },
    });
  }

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  findUserByIdSimple(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  findUserByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });
  }

  findAccountByIdentifier(identifier: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: [{ email: identifier }, { username: identifier }],
    });
  }

  async editUser(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.userRepository.findOne({ where: { id } });
  }

  async create(
    userData: Partial<User>,
    accountData: Partial<Account>,
  ): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, userData);
      const createdUser = await manager.save(User, user);

      const account = manager.create(Account, {
        ...accountData,
        userId: createdUser.id,
      });
      await manager.save(Account, account);

      createdUser.account = account;

      // Return user WITHOUT the account relation
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { account: _, ...userWithoutAccount } = createdUser;
      return userWithoutAccount as User;
    });
  }

  async findUsersWithPagination(
    query: string,
    page: number = 1,
    limit: number = 15,
  ): Promise<GetUsersResponseDto> {
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = [];
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      searchConditions.push(
        { username: Like(searchTerm) },
        { first_name: Like(searchTerm) },
        { last_name: Like(searchTerm) },
        { email: Like(searchTerm) },
      );
    }

    // Get total count
    const totalUsers = await this.userRepository.count({
      where: searchConditions.length > 0 ? searchConditions : {},
    });

    // Get paginated users
    const users = await this.userRepository.find({
      where: searchConditions.length > 0 ? searchConditions : {},
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    // Map to response format
    const userData = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
    }));

    const pagination = {
      current_page: page,
      total_pages: Math.ceil(totalUsers / limit),
      total_items: totalUsers,
    };

    return {
      data: userData.length > 0 ? userData : null,
      pagination,
    };
  }

  async updateUserBalance(
    id: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Promise<UpdateBalanceResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return null;
    }

    // Update balance
    const newBalance = user.balance + updateBalanceDto.increment;
    await this.userRepository.update(id, { balance: newBalance });

    return {
      id: user.id,
      username: user.username,
      balance: newBalance,
    };
  }

  async findUserById(id: string): Promise<GetUserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['enrollments'],
    });

    if (!user) {
      return null;
    }

    // Count courses purchased
    const coursesPurchased = await this.transactionRepository.count({
      where: { user: { id } },
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
      courses_purchased: coursesPurchased,
    };
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!user) {
      return null;
    }

    // Check if user is admin (cannot update admin)
    if (user.account && user.account.role === Role.ADMIN) {
      return null;
    }

    return await this.dataSource.transaction(async (manager) => {
      const updateData: Partial<User> = {};
      const accountUpdateData: Partial<Account> = {};

      if (updateUserDto.email) {
        updateData.email = updateUserDto.email;
        accountUpdateData.email = updateUserDto.email;
      }
      if (updateUserDto.username) {
        updateData.username = updateUserDto.username;
        accountUpdateData.username = updateUserDto.username;
      }
      if (updateUserDto.first_name) {
        updateData.first_name = updateUserDto.first_name;
      }
      if (updateUserDto.last_name) {
        updateData.last_name = updateUserDto.last_name;
      }

      // Update user
      if (Object.keys(updateData).length > 0) {
        await manager.update(User, id, updateData);
      }

      // Update account if needed
      if (Object.keys(accountUpdateData).length > 0) {
        await manager.update(Account, user.account.userId, accountUpdateData);
      }

      // Hash and update password if provided
      if (updateUserDto.password) {
        const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
        await manager.update(Account, user.account.userId, {
          password: hashedPassword,
        });
      }

      // Get updated user
      const updatedUser = await manager.findOne(User, { where: { id } });

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        balance: updatedUser.balance,
      };
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!user) {
      return false;
    }

    // Check if user is admin (cannot delete admin)
    if (user.account && user.account.role === Role.ADMIN) {
      return false;
    }

    await this.userRepository.delete(id);
    return true;
  }
}
