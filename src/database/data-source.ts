import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { createDatabaseConfig } from './database.config';

config();

export const dbConfig = createDatabaseConfig();
export const AppDataSource = new DataSource(dbConfig);
