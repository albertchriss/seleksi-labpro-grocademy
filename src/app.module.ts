import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from './database/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TransactionModule } from './transaction/transaction.module';
import { ModulesModule } from './modules/modules.module';
import { MinioModule } from './minio/minio.module';
import { MediaModule } from './media/media.module';
import { PdfService } from './pdf/pdf.service';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        createDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    CoursesModule,

    UsersModule,

    AuthModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),

    TransactionModule,

    ModulesModule,

    MinioModule,

    MediaModule,

    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService, PdfService],
})
export class AppModule {}
