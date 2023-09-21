import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Posts } from './posts.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadVideoResponseDto } from './dto/upload-video-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created',
    type: Posts,
  })
  @ApiBearerAuth()
  @Roles('ADMIN', 'TRAINER')
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<Posts> {
    return this.postsService.createPost(createPostDto);
  }

  @ApiOperation({ summary: 'Get all posts by group id' })
  @ApiResponse({ status: 200, type: [Posts] })
  @Get('/group/:groupId')
  async getAllByGroupId(@Param('groupId') groupId: number): Promise<Posts[]> {
    return this.postsService.getPostsByGroupId(groupId);
  }
  @ApiOperation({ summary: 'Upload new video' })
  @ApiResponse({ status: 200, type: UploadVideoResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Select a video file to upload',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/:postId/video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './client/videos',
        filename: (req, file, cb) => {
          const randomName = `${new Date().getTime()}-${Math.round(
            Math.random() * 10000,
          ).toString(5)}`;

          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 100000000 },
    }),
  )
  async uploadVideo(
    @Param('postId') postId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000000 }),
          new FileTypeValidator({ fileType: '.mp4' }),
        ],
      }),
    )
    video: Express.Multer.File,
  ): Promise<UploadVideoResponseDto> {
    const videoUrl = `${process.env.ROOT_URL}:${process.env.PORT}/videos/${video.filename}`;

    await this.postsService.updatePostVideoUrl(postId, videoUrl);

    return { video: videoUrl };
  }

  @ApiOperation({ summary: 'Delete video by post id' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @Roles('ADMIN', 'TRAINER')
  @UseGuards(RolesGuard)
  @Delete('/:postId/video')
  async deleteVideo(@Param('postId') postId: number): Promise<boolean> {
    return this.postsService.deleteVideo(postId);
  }

  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @Roles('ADMIN', 'TRAINER')
  @UseGuards(RolesGuard)
  @Delete('/:postId')
  async deletePost(@Param('postId') postId: number): Promise<boolean> {
    return this.postsService.deletePostById(postId);
  }
}
