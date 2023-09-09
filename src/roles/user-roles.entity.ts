import {
  Entity,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from './roles.entity';

@Entity('users_roles')
export class UserRoles extends BaseEntity {
  @PrimaryColumn({ type: 'int', name: 'role_id' })
  roleId: number;

  @PrimaryColumn({ type: 'int', name: 'user_id' })
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
