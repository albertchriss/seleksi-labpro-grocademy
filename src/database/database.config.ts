import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const createDatabaseConfig = (
  configService?: ConfigService,
): DataSourceOptions => {
  // Use ConfigService if available, otherwise fallback to process.env
  const getConfig = (key: string, defaultValue?: string) => {
    if (configService) {
      return configService.get<string>(key) || defaultValue;
    }
    return process.env[key] || defaultValue;
  };

  return {
    type: 'postgres',
    url: getConfig('DATABASE_URL'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: getConfig('NODE_ENV') === 'development',
    // logging: getConfig('NODE_ENV') === 'development',
    logging: false,
  };
};
