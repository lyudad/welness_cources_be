import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'userEmail@example.com', description: 'Email' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ example: 'MyStr0ngP@ssword!', description: 'Strong password' })
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
