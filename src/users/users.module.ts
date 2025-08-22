import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { Account } from 'src/entities/account.entity';
import { Transaction } from 'src/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Account, Transaction])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
