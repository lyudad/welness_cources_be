import { ApiProperty } from '@nestjs/swagger';

export class UploadVideoResponseDto {
  @ApiProperty({ example: 'http://domain/path-to-video' })
  video: string;
}
