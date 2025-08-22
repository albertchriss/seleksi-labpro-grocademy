import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { Media } from 'src/entities/media.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), MinioModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
