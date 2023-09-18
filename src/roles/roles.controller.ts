import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from './roles.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create one role' })
  @ApiResponse({ status: 200, type: Role })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(dto);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, type: [Role] })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  async getAll(): Promise<Role[]> {
    const roles = await this.rolesService.getAllRoles();

    if (!roles.length) throw new NotFoundException();

    return roles;
  }

  @ApiOperation({ summary: 'Get role by name' })
  @ApiResponse({ status: 200, type: Role })
  @ApiParam({ name: 'value', description: 'Value of the role', type: 'string' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('/:value')
  async getByValue(@Param('value') value: string): Promise<Role> {
    const [roles] = await this.rolesService.getRoleByValue(value);

    if (!roles) throw new NotFoundException();

    return roles;
  }

  @ApiOperation({ summary: 'Update role by value' })
  @ApiResponse({ status: 200, type: Role })
  @ApiParam({ name: 'value', description: 'Value of the role', type: 'string' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Patch('/:value')
  async updateRoleDescription(
    @Param('value') value: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return await this.rolesService.updateRole(value, updateRoleDto);
  }

  @ApiOperation({ summary: 'Remove role by name' })
  @ApiResponse({ status: 200 })
  @ApiParam({ name: 'value', description: 'Value of the role', type: 'string' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('/:value')
  async remove(@Param('value') value: string): Promise<boolean> {
    return await this.rolesService.removeRoleByValue(value);
  }
}
