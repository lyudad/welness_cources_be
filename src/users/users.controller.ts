import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RemoveRoleDto } from './dto/remove-role.dto';
import * as process from 'process';
import { UploadAvatarResponseDto } from './dto/upload-avatar-response.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { extname } from 'path';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({ summary: 'Create one user' })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.userService.createUser(userDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    const allUsers = await this.userService.findAll();

    if (!allUsers.length) throw new NotFoundException();

    return allUsers;
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/:userId')
  async getById(@Param('userId') userId: number): Promise<User> {
    const user = await this.userService.findById(userId);

    if (!user) throw new NotFoundException('User with such id not found');

    return user;
  }

  @ApiOperation({ summary: 'Upload new user avatar' })
  @ApiResponse({ status: 200, type: UploadAvatarResponseDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Select a file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './client',
        filename: (req, file, cb) => {
          const randomName = `${new Date().getTime()}-${Math.round(
            Math.random() * 10000,
          ).toString(5)}`;

          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req,
  ): Promise<UploadAvatarResponseDto> {
    const userId = req.user.id;
    const avatarUrl = `${process.env.ROOT_URL}:${process.env.PORT}/${file.filename}`;

    await this.userService.updateUserAvatar(userId, avatarUrl);

    return { avatar: avatarUrl };
  }

  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  async deleteAvatar(@Request() req): Promise<boolean> {
    const userId = req.user.id;

    await this.userService.deleteUserAvatar(userId);

    return true;
  }

  @ApiOperation({ summary: 'Remove user' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/:userId')
  async removeUser(@Param('userId') userId: number): Promise<boolean> {
    return await this.userService.removeById(userId);
  }

  @ApiOperation({ summary: 'Add role specific user' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('/role')
  async addRole(@Body() addRoleDto: AddRoleDto): Promise<boolean> {
    return await this.userService.addRole(addRoleDto);
  }

  @ApiOperation({ summary: 'Remove role from specific user' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('/role/:userId')
  async removeRole(
    @Param('userId') userId: number,
    @Body() removeRoleDto: RemoveRoleDto,
  ): Promise<boolean> {
    const group = await this.userService.removeRole(userId, removeRoleDto);

    if (!group) throw new NotFoundException('Group with provided id not found');

    return group;
  }
}
