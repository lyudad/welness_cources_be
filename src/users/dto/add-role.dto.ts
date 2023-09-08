import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  readonly userId: number;
}
