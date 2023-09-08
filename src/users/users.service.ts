import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { AddRoleDto } from './dto/add-role.dto';
import { RemoveRoleDto } from './dto/remove-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = this.usersRepository.create(dto);

    const role = await this.roleService.getRoleByValue('USER');

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    user.roles = [role];

    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({ relations: ['roles'] });
  }

  async removeById(userId: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.usersRepository.remove(user);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async addRole(addRoleDto: AddRoleDto): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: addRoleDto.userId },
      relations: ['roles'],
    });

    const role = await this.roleService.getRoleByValue(addRoleDto.value);

    if (!user || !role) {
      throw new HttpException('User or role not found', HttpStatus.NOT_FOUND);
    }

    if (user.roles) {
      const existingRole = user.roles.find(
        (userRole) => userRole.id === role.id,
      );

      if (existingRole) {
        throw new HttpException(
          'User already has this role',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.roles = [...user.roles, role];
    } else {
      user.roles = [role];
    }

    try {
      await this.usersRepository.save(user);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async removeRole(
    userId: number,
    removeRoleDto: RemoveRoleDto,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    const role = await this.roleService.getRoleByValue(removeRoleDto.value);

    if (!user || !role || !user.roles) {
      throw new HttpException('User or role not found', HttpStatus.NOT_FOUND);
    }

    user.roles = [...user.roles.filter((userRole) => userRole.id === role.id)];

    try {
      await this.usersRepository.save(user);
      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
