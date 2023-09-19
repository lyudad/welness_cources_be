import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Group } from './groups.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    private userService: UsersService,
  ) {}

  async createGroup(dto: CreateGroupDto): Promise<Group> {
    const existingGroup = await this.findByName(dto.name);

    if (existingGroup) {
      throw new BadRequestException('Group with this name already exists');
    }

    const user = this.groupRepository.create(dto);

    return await this.groupRepository.save(user);
  }

  async createGroupWithTrainer(
    userId: number,
    dto: CreateGroupDto,
  ): Promise<Group> {
    const existingGroup = await this.findByName(dto.name);

    if (existingGroup) {
      throw new BadRequestException('Group with this name already exists');
    }

    const exitingUser = await this.userService.checkExitingUserById(userId);

    const group = this.groupRepository.create({
      name: dto.name,
      trainer: exitingUser,
    });

    return await this.groupRepository.save(group);
  }

  async getTrainingGroups(userId: number): Promise<Group[]> {
    return await this.findAllByTrainerId(userId);
  }

  async joinGroup(groupId: number, userId: number): Promise<boolean> {
    await this.checkExitingGroupById(groupId);
    await this.userService.checkExitingUserById(userId);

    try {
      await this.userService.addGroup(groupId, userId);
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }

    return true;
  }

  async leaveGroup(groupId: number, userId: number): Promise<boolean> {
    await this.checkExitingGroupById(groupId);
    await this.userService.checkExitingUserById(userId);

    try {
      await this.userService.removeGroup(userId);
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }

    return true;
  }

  async leaveGroupByTrainer(groupId: number, userId: number): Promise<boolean> {
    await this.checkExitingGroupById(groupId);
    await this.userService.checkExitingUserById(userId);

    try {
      await this.removeTrainerById(groupId);
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }

    return true;
  }

  async removeGroup(groupId: number): Promise<boolean> {
    await this.checkExitingGroupById(groupId);
    try {
      await this.userService.clearGroups(groupId);
      await this.deleteGroup(groupId);
    } catch (e) {
      throw new BadRequestException('Something went wrong');
    }

    return true;
  }

  async checkExitingGroupById(groupId: number): Promise<Group> {
    const exitingGroup = await this.findById(groupId);

    if (!exitingGroup)
      throw new NotFoundException('Group with provided id not found');

    return exitingGroup;
  }

  async findAll(): Promise<Group[]> {
    const query = `
      SELECT * from groups;
    `;

    return await this.groupRepository.query(query);
  }

  async findAllByTrainerId(userId: number): Promise<Group[]> {
    const query = `
      SELECT groups.id, groups.name, groups.description, groups.trainer_id AS "trainerId", groups.created_at AS "createdAt", groups.updated_at AS "updatedAt",
        CASE
          WHEN COUNT(users.id) > 0 THEN json_agg(json_build_object('id', users.id, 'firstName', users.first_name, 'lastName', users.last_name, 'email', users.email, 'avatar', users.avatar))
          ELSE NULL
        END AS users
      FROM groups
      LEFT JOIN users ON groups.id = users.group_id
      WHERE groups.trainer_id = $1
      GROUP BY groups.id, groups.name;
    `;

    return await this.groupRepository.query(query, [userId]);
  }

  async findById(groupId: number): Promise<Group> {
    const query = `
      SELECT * from groups WHERE id = $1;
    `;
    const [group] = await this.groupRepository.query(query, [groupId]);

    return group;
  }

  async findByIdWithUsers(groupId: number): Promise<Group> {
    const query = `
      SELECT groups.id, groups.name, groups.description, groups.trainer_id AS "trainerId", groups.created_at AS "createdAt", groups.updated_at AS "updatedAt",
        CASE
          WHEN COUNT(users.id) > 0 THEN json_agg(json_build_object('id', users.id, 'firstName', users.first_name, 'lastName', users.last_name, 'email', users.email, 'avatar', users.avatar))
          ELSE NULL
        END AS users
      FROM groups
      LEFT JOIN users ON groups.id = users.group_id
      WHERE groups.id = $1
      GROUP BY groups.id, groups.name;
    `;

    const [group] = await this.groupRepository.query(query, [groupId]);

    return group;
  }

  async findByName(name: string): Promise<Group> {
    const query = `
      SELECT * FROM groups WHERE name = $1;
    `;

    const [group] = await this.groupRepository.query(query, [name]);

    return group;
  }

  async deleteGroup(groupId: number): Promise<void> {
    const query = `
      DELETE FROM groups WHERE id = $1;
    `;

    await this.groupRepository.query(query, [groupId]);
  }

  async removeTrainerById(groupId: number): Promise<void> {
    const query = `
      UPDATE groups SET trainer_id = NULL WHERE id = $1;
    `;

    await this.groupRepository.query(query, [groupId]);
  }
}
