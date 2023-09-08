import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RemoveRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsNotEmpty()
  readonly value: string;
}
