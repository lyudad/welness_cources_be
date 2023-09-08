import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty({
    example: 'Administrator',
    description: 'Description of the role',
  })
  readonly description: string;
}
