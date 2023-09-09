import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  BaseEntity,
  JoinTable,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

@Entity('role')
export class Role extends BaseEntity {
  @ApiProperty({ example: 0, description: 'Unique identifier' })
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Unique role name' })
  @Column({ type: 'varchar', name: 'value', nullable: false, unique: true })
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    example: 'Administrator',
    description: 'Description of the role',
  })
  @Column({ type: 'varchar', name: 'description', nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.roles, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users?: User[];
}
