import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
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
    return await this.userService.removeRole(userId, removeRoleDto);
  }
}
