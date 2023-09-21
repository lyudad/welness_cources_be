import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword' })
  @IsNotEmpty()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({ example: 'newPassword' })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'newPassword' })
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}
