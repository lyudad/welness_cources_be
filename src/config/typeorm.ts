import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserRoles } from '../roles/user-roles.entity';
import { Role } from '../roles/roles.entity';
import { User } from '../users/user.entity';
import { Group } from '../groups/groups.entity';
import { Posts } from '../posts/posts.entity';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Role, UserRoles, Group, Posts],
  synchronize: true,
  autoLoadEntities: true,
  migrations: ['dist/db/migrations/*.js'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
