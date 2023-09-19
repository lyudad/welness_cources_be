import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './posts.entity';
import { AuthModule } from '../auth/auth.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [TypeOrmModule.forFeature([Posts]), AuthModule, GroupsModule],
})
export class PostsModule {}
