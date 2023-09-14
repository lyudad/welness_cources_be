import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from '../users/dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({ status: 200, type: AuthResponseDto })
  @HttpCode(200)
  @Post('/login')
  async login(@Body() userDto: CreateUserDto): Promise<AuthResponseDto> {
    const { user, token } = await this.authService.login(userDto);

    return {
      token,
      user: new UserResponseDto(user),
    };
  }

  @ApiResponse({ status: 200, type: AuthResponseDto })
  @HttpCode(200)
  @Post('/sign-up')
  async registration(@Body() userDto: CreateUserDto): Promise<AuthResponseDto> {
    const { user, token } = await this.authService.registration(userDto);

    return {
      token,
      user: new UserResponseDto(user),
    };
  }
}
