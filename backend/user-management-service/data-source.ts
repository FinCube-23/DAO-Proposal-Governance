import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';
config({ path: '.env.local' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false, // always false for migrations
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});

module.exports = AppDataSource;