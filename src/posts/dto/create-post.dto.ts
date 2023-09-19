import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Post Title', description: 'Title of the post' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Post Description',
    description: 'Description of the post',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 1, description: 'ID of the group' })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
