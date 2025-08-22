import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      // port: +this.configService.get<number>('MINIO_PORT'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET');
  }

  /**
   * Uploads a file to MinIO and returns the unique object name.
   */
  public async upload(
    file: Express.Multer.File,
  ): Promise<{ objectName: string }> {
    try {
      const objectName = `${uuidv4()}-${file.originalname.replace(/\s/g, '_')}`;
      const metaData = { 'Content-Type': file.mimetype };

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        metaData,
      );

      return { objectName };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error uploading file: ${error.message}`);
        throw new Error(`Failed to upload file to MinIO: ${error.message}`);
      }
      throw new Error(`Failed to upload file to MinIO`);
    }
  }

  /**
   * Generates a presigned URL for a private object.
   */
  public async getPresignedUrl(
    objectName: string,
    expiryInSeconds: number = 3600, // Default to 1 hour
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiryInSeconds,
      );
      return url;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error uploading file: ${error.message}`);
        throw new Error(`Failed to upload file to MinIO: ${error.message}`);
      }
      throw new Error(`Failed to upload file to MinIO`);
    }
  }
}
