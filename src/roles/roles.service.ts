import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { Repository } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    await this.checkExistingRoleByValue(dto.value);

    const newRole = this.rolesRepository.create(dto);

    return await this.rolesRepository.save(newRole);
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.rolesRepository.query('SELECT * FROM role');
  }

  async getRoleByValue(value: string): Promise<Role[]> {
    return await this.rolesRepository.query(
      'SELECT * FROM role WHERE value = $1',
      [value],
    );
  }

  async updateRole(value: string, dto: UpdateRoleDto): Promise<Role> {
    const [role] = await this.getRoleByValue(value);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.description = dto.description;

    try {
      await this.rolesRepository.save(role);
      return role;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async removeRoleByValue(value: string): Promise<boolean> {
    const roleToDelete = await this.getRoleByValue(value);

    if (!roleToDelete) {
      throw new NotFoundException('Role not found');
    }

    try {
      await this.rolesRepository.remove(roleToDelete);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async checkExistingRoleByValue(value: string): Promise<void> {
    const [existingRole] = await this.getRoleByValue(value);

    if (existingRole) {
      throw new BadRequestException('This role already exists');
    }
  }
}
