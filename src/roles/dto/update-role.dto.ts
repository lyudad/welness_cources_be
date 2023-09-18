import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    example: 'New description here',
    description: 'Description of the role',
  })
  @IsNotEmpty()
  readonly description: string;
}
