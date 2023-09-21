import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './groups.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupService: GroupsService) {}

  @ApiOperation({ summary: 'Create group' })
  @ApiResponse({ status: 200, type: Group })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createGroupDto: CreateGroupDto): Promise<Group> {
    return await this.groupService.createGroup(createGroupDto);
  }

  @ApiOperation({ summary: 'Create group with trainer' })
  @ApiResponse({ status: 200, type: Group })
  @ApiBearerAuth()
  @Roles('ADMIN', 'TRAINER')
  @UseGuards(RolesGuard)
  @Post('user/:userId')
  async createWithTrainer(
    @Param('userId') userId: number,
    @Body()
    createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return await this.groupService.createGroupWithTrainer(
      userId,
      createGroupDto,
    );
  }

  @ApiOperation({ summary: 'Get training groups' })
  @ApiResponse({ status: 200, type: [Group] })
  @ApiBearerAuth()
  @Roles('ADMIN', 'TRAINER')
  @UseGuards(RolesGuard)
  @Get('training')
  async getTrainingGroups(@Request() req): Promise<Group[]> {
    return await this.groupService.getTrainingGroups(req.user.id);
  }

  @ApiOperation({ summary: 'Leave group by id' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:groupId/trainer/leave')
  leaveByTrainer(
    @Param('groupId') groupId: number,
    @Request() req,
  ): Promise<boolean> {
    return this.groupService.leaveGroupByTrainer(groupId, req.user.id);
  }

  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({ status: 200, type: [Group] })
  @Get()
  getAll(): Promise<Group[] | []> {
    return this.groupService.findAll();
  }

  @ApiOperation({ summary: 'Get group by id' })
  @ApiResponse({ status: 200, type: Group })
  @Get('/:groupId')
  async getById(@Param('groupId') groupId: number): Promise<Group> {
    const group = await this.groupService.findByIdWithUsers(groupId);

    if (!group) {
      throw new NotFoundException('Group with provided id not found');
    }

    return group;
  }

  @ApiOperation({ summary: 'Join group by id' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:groupId/join')
  join(@Param('groupId') groupId: number, @Request() req): Promise<boolean> {
    return this.groupService.joinGroup(groupId, req.user.id);
  }

  @ApiOperation({ summary: 'Leave group by id' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/:groupId/leave')
  leave(@Param('groupId') groupId: number, @Request() req): Promise<boolean> {
    return this.groupService.leaveGroup(groupId, req.user.id);
  }

  @ApiOperation({ summary: 'Delete group by id' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('/:groupId')
  remove(@Param('groupId') groupId: number): Promise<boolean> {
    return this.groupService.removeGroup(groupId);
  }
}
