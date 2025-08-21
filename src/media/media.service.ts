import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from 'src/entities/media.entity';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly minioClientService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  async uploadMedia(file: Express.Multer.File): Promise<Media> {
    const { objectName } = await this.minioClientService.upload(file);

    if (!objectName) {
      return null;
    }

    const newMedia = this.mediaRepository.create({
      originalName: file.originalname,
      objectName: objectName,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.mediaRepository.save(newMedia);
  }

  transformToUrl(id: string): string {
    return `${this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000'}/api/media/${id}/view`;
  }

  async getMediaUrl(id: string): Promise<{ url: string }> {
    const file = await this.mediaRepository.findOneBy({ id });
    if (!file) {
      throw new NotFoundException('Media not found');
    }
    const expiry = 3600;

    const url = await this.minioClientService.getPresignedUrl(
      file.objectName,
      expiry,
    );
    return { url };
  }
}
