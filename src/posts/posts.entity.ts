import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Group } from '../groups/groups.entity';

@Entity('posts')
export class Posts extends BaseEntity {
  @ApiProperty({ example: 0, description: 'Unique identifier' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({ example: 'Post Title', description: 'Title of the post' })
  @Column({ type: 'varchar', name: 'title' })
  title: string;

  @ApiProperty({
    example: 'Post Description',
    description: 'Description of the post',
  })
  @Column({ type: 'text', name: 'description' })
  description: string;

  @ApiProperty({ example: 'Video URL', description: 'URL of the video' })
  @Column({ type: 'varchar', name: 'video_url', nullable: true })
  videoUrl: string;

  @ManyToOne(() => Group, (group) => group.posts, { nullable: false })
  group: Group;
}
