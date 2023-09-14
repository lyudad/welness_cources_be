import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ example: '_userTokenHere_' })
  token: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
