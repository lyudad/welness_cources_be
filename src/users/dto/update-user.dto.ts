import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'Illia' })
  readonly firstName: string;

  @ApiProperty({ example: 'Bear' })
  readonly lastName: string;
}
