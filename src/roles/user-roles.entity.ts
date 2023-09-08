import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './roles.entity';

@Entity('users_roles')
export class UserRoles extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'role_id' })
  roleId: number;

  @Column({ type: 'int', name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.roles, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  users: User[];

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'id' }])
  roles: Role[];
}
