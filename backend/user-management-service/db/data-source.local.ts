import { DataSource } from "typeorm";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local file
config({ path: join(__dirname, '../.env.local') });

let connectionOptions: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,       // Fixed: was using DB name
  password: process.env.POSTGRES_PASSWORD,   // Fixed: was using username
  database: process.env.POSTGRES_DB,        // Fixed: was using password
  synchronize: false,
  logging: true,
  entities: [join(__dirname, "../src/**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "./migrations/*{.ts,.js}")]
};

export default new DataSource({
  ...connectionOptions,
});