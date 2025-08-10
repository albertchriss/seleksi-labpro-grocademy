import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/entities/account.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

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

  findUserById(id: string): Promise<User | null> {
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
}
