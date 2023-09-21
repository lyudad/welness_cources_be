import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'Fitness' })
  name: string;

  @ApiProperty({ example: 'The best group ever' })
  description: string;
}
