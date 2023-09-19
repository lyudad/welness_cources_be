import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from './posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { GroupsService } from '../groups/groups.service';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
    private groupsService: GroupsService,
  ) {}

  async createPost(dto: CreatePostDto): Promise<Posts> {
    const existingGroup = await this.groupsService.checkExitingGroupById(
      dto.groupId,
    );

    const post = this.postsRepository.create({ ...dto, group: existingGroup });

    return this.postsRepository.save(post);
  }

  async getPostsByGroupId(groupId: number): Promise<Posts[]> {
    const existingGroup =
      await this.groupsService.checkExitingGroupById(groupId);

    return await this.findByGroupId(existingGroup.id);
  }

  async updatePostVideoUrl(postId: number, videoUrl: string): Promise<void> {
    await this.removeVideoFromFSByPostId(postId);

    try {
      await this.addVideoUrl(postId, videoUrl);
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }
  }

  async deletePostById(postId: number): Promise<boolean> {
    return this.deleteById(postId);
  }

  async deleteVideo(postId: number): Promise<boolean> {
    await this.removeVideoFromFSByPostId(postId);

    await this.addVideoUrl(postId, null);

    return true;
  }

  async removeVideoFromFSByPostId(postId: number): Promise<void> {
    const existingGroup = await this.checkExistingPostById(postId);

    if (existingGroup.videoUrl) {
      const fileName = new URL(existingGroup.videoUrl).pathname.split('/')[2];
      const filePath = join(
        __dirname,
        '..',
        '..',
        'client',
        'videos',
        fileName,
      );

      this.removeVideoFromFS(filePath);
    }
  }

  async checkExistingPostById(postId: number): Promise<Posts> {
    const existingPost = await this.findById(postId);

    if (!existingPost) {
      throw new NotFoundException('Post with provided id not found');
    }

    return existingPost;
  }

  async addVideoUrl(postId: number, videoUrl: string | null) {
    const query = `
      UPDATE posts SET video_url = $1 WHERE id = $2;
    `;

    return await this.postsRepository.query(query, [videoUrl, postId]);
  }

  removeVideoFromFS(filePath: string) {
    try {
      fs.access(filePath, (err) => {
        if (err) {
          console.error(
            `[ERROR] deleteUserAvatar -> fs.access: [${err.message}]`,
          );
        }
      });
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(
            `[ERROR] deleteUserAvatar -> fs.unlink: [${err.message}]`,
          );
        }
      });
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Something went wrong');
    }
  }

  async findById(postId: number): Promise<Posts> {
    return await this.postsRepository
      .createQueryBuilder('posts')
      .where('posts.id = :postId', { postId })
      .getOne();
  }

  async findByGroupId(groupId: number): Promise<Posts[]> {
    try {
      return await this.postsRepository
        .createQueryBuilder('posts')
        .where('posts.groupId = :groupId', { groupId })
        .getMany();
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }
  }

  async deleteById(postId: number): Promise<boolean> {
    const deleteResult = await this.postsRepository
      .createQueryBuilder('posts')
      .delete()
      .from(Posts)
      .where('id = :postId', { postId })
      .execute();

    if (deleteResult.affected !== 1) {
      throw new NotFoundException('Post with provided id not found');
    }

    return true;
  }
}
