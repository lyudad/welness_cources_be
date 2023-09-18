import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

@Entity('groups')
export class Group extends BaseEntity {
  @ApiProperty({ example: 0, description: 'Unique identifier' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({ example: 'Group Name', description: 'Name of the group' })
  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.group)
  users: User[];

  @ManyToOne(() => User, (user) => user.groups)
  @JoinColumn({ name: 'trainer_id' })
  trainer: User;

  @ApiProperty({ example: '2023-09-07 12:21:17.451435 +00:00' })
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @ApiProperty({ example: '2023-09-07 12:21:17.451435 +00:00' })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}
