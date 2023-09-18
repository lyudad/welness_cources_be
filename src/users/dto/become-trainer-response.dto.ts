import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../roles/roles.entity';

export class BecomeTrainerResponseDto {
  @ApiProperty({ example: '_newUserTokenHere_' })
  token: string;

  @ApiProperty({ type: Role })
  newRole: Role;
}
