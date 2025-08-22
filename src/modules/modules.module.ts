import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { Module as ModuleEntity } from '../entities/module.entity';
import { UserProgress } from '../entities/user-progress.entity';
import { Transaction } from '../entities/transaction.entity';
import { MediaModule } from 'src/media/media.module';
import { Account } from 'src/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModuleEntity,
      UserProgress,
      Transaction,
      Account,
    ]),
    MediaModule,
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
