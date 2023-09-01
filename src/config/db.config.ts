import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { User } from 'src/auth/entities/auth.entity';
import { Follower } from 'src/auth/entities/follower.entity';
import { Comment } from 'src/post/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';

dotenv.config();

const dbConfig = {
  host: process.env.TYPE_ORM_DATABASE_HOST,
  port: process.env.TYPE_ORM_DATABASE_PORT,
  username: process.env.TYPE_ORM_DATABASE_USERNAME,
  password: process.env.TYPE_ORM_DATABASE_PASSWORD,
  name: process.env.TYPE_ORM_DATABASE_NAME,
};

console.log(dbConfig);

export const orm_config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: +dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.name,
  entities: [
    User,
    Follower,
    Post,
    Comment,
  ],
  synchronize: false,
  // logging: true
};