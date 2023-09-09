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
    const [existingUser] = await this.findByEmail(dto.email);

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = this.usersRepository.create(dto);

    const [role] = await this.roleService.getRoleByValue('USER');

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    user.roles = [role];

    return await this.usersRepository.save(user);
  }

  async removeById(userId: number): Promise<boolean> {
    const user = await this.findById(userId);

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
    const [user] = await this.findById(addRoleDto.userId);

    const [role] = await this.roleService.getRoleByValue(addRoleDto.value);

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
    const [user] = await this.findById(userId);

    const [role] = await this.roleService.getRoleByValue(removeRoleDto.value);

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

  async findByEmail(email: string): Promise<User[]> {
    const query = `
      SELECT users.id, users.first_name, users.last_name, users.email, users.password,
         json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)) AS roles
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      WHERE users.email = $1
      GROUP BY users.id
    `;

    return await this.usersRepository.query(query, [email]);
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT users.id, users.first_name, users.last_name, users.email,
         json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)) AS roles
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      GROUP BY users.id
    `;

    return await this.usersRepository.query(query);
  }

  async findById(userId: number): Promise<User[]> {
    const query = `
      SELECT users.id, users.first_name, users.last_name, users.email,
         json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)) AS roles
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      WHERE users.id = $1
      GROUP BY users.id
    `;

    return await this.usersRepository.query(query, [userId]);
  }
}
