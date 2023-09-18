import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('/password/change')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req,
  ): Promise<boolean> {
    return await this.authService.changePassword(
      changePasswordDto,
      req.user.id,
    );
  }
}
