import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './auth/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

// Used by the TypeORM CLI only (migration:generate/run/revert). The running
// app builds its own DataSource in app.module.ts via TypeOrmModule.forRootAsync.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, RefreshToken],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
