import {
  BadRequestException,
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
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
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
    const user = await this.findById(addRoleDto.userId);

    const [role] = await this.roleService.getRoleByValue(addRoleDto.value);

    if (!user || !role) {
      throw new NotFoundException('User or role not found');
    }

    if (user.roles) {
      const existingRole = user.roles.find(
        (userRole) => userRole.id === role.id,
      );

      if (existingRole) {
        throw new BadRequestException('User already has this role');
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
    const user = await this.findById(userId);

    const [role] = await this.roleService.getRoleByValue(removeRoleDto.value);

    if (!user || !role || !user.roles) {
      throw new NotFoundException('User or role not found');
    }

    if (role.value === 'USER') {
      throw new BadRequestException("Can't remove default role");
    }

    user.roles = [...user.roles.filter((userRole) => userRole.id !== role.id)];

    try {
      await this.usersRepository.save(user);

      return true;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async checkExitingUserById(userId: number): Promise<User> {
    const exitingUser = await this.findById(userId);

    if (!exitingUser) {
      throw new NotFoundException('Group with provided id not found');
    }

    return exitingUser;
  }

  async updateUserAvatar(userId: number, avatarUrl: string) {
    const existingUser = await this.checkExitingUserById(userId);

    if (existingUser.avatar) {
      const fileName = new URL(existingUser.avatar).pathname.replace('/', '');
      const filePath = join(__dirname, '..', '..', 'client', fileName);

      this.removeAvatarFromFS(filePath);
    }

    try {
      await this.addAvatarUrl(userId, avatarUrl);
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }
  }

  async deleteUserAvatar(userId: number) {
    const existingUser = await this.checkExitingUserById(userId);

    if (!existingUser.avatar) {
      throw new BadRequestException("User don't have avatar");
    }

    const fileName = new URL(existingUser.avatar).pathname.replace('/', '');
    const filePath = join(__dirname, '..', '..', 'client', fileName);

    await this.removeAvatar(userId);

    this.removeAvatarFromFS(filePath);
  }

  removeAvatarFromFS(filePath: string) {
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
      throw new BadRequestException('Something went wrong');
    }
  }

  async addAvatarUrl(userId: number, avatarUrl: string): Promise<User> {
    const query = `
      UPDATE users SET avatar = $1 WHERE id = $2;
    `;

    return await this.usersRepository.query(query, [avatarUrl, userId]);
  }

  async removeAvatar(userId: number): Promise<User> {
    const query = `
      UPDATE users SET avatar = NULL WHERE id = $1;
    `;

    return await this.usersRepository.query(query, [userId]);
  }

  async addGroup(groupId: number, userId: number): Promise<User> {
    const query = `
      UPDATE users SET group_id = $1 WHERE id = $2;
    `;

    return await this.usersRepository.query(query, [groupId, userId]);
  }

  async removeGroup(userId: number): Promise<User> {
    const query = `
      UPDATE users SET group_id = NULL WHERE id = $1;
    `;

    return await this.usersRepository.query(query, [userId]);
  }

  async clearGroups(groupId: number): Promise<User> {
    const query = `
      UPDATE users SET group_id = NULL WHERE group_id = $1;
    `;

    return await this.usersRepository.query(query, [groupId]);
  }

  async findByEmail(email: string): Promise<User[]> {
    const query = `
      SELECT users.id, users.first_name AS "firstName", users.last_name AS "lastName", users.email, users.avatar, users.group_id AS "group",
        json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)) AS roles,
        CASE
          WHEN COUNT(groups.id) > 0 THEN json_build_object('id', groups.id, 'groupName', groups.name)
          ELSE NULL
        END AS group
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      LEFT JOIN groups ON users.group_id = groups.id
      WHERE users.email = $1
      GROUP BY users.id, groups.id;
    `;

    return await this.usersRepository.query(query, [email]);
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const query = `
      SELECT
        users.id,
        users.first_name AS "firstName",
        users.last_name AS "lastName",
        users.email,
        users.avatar,
        users.password,
        users.group_id AS "group",
        COALESCE(json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)), '[]') AS roles,
        CASE
          WHEN COUNT(groups.id) > 0 THEN json_build_object('id', groups.id, 'groupName', groups.name)
          ELSE NULL
        END AS group
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      LEFT JOIN groups ON users.group_id = groups.id
      WHERE users.email = $1
      GROUP BY users.id, groups.id;
    `;

    const [user] = await this.usersRepository.query(query, [email]);

    return user;
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT users.id, users.first_name AS "firstName", users.last_name AS "lastName", users.email, users.avatar,
         json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)) AS roles,
        CASE
          WHEN COUNT(groups.id) > 0 THEN json_build_object('id', groups.id, 'groupName', groups.name)
          ELSE NULL
        END AS group
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      LEFT JOIN groups ON users.group_id = groups.id
      GROUP BY users.id, groups.id;
    `;

    return await this.usersRepository.query(query);
  }

  async findById(userId: number): Promise<User> {
    const query = `
      SELECT users.id, users.first_name AS "firstName", users.last_name AS "lastName", users.email, users.avatar, users.group_id AS "group",
         json_agg(json_build_object('id', role.id, 'value', role.value, 'description', role.description)) AS roles
      FROM users
      LEFT JOIN users_roles ON users.id = users_roles.user_id
      LEFT JOIN role ON users_roles.role_id = role.id
      WHERE users.id = $1
      GROUP BY users.id
    `;

    const [user] = await this.usersRepository.query(query, [userId]);

    return user;
  }
}
