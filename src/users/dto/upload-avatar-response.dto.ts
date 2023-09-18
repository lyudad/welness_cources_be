import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({ example: 'http://domain/path-to-avatar' })
  avatar: string;
}
