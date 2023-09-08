import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Response } from 'express';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({ status: 200, type: User })
  @Post('/login')
  async login(
    @Body() userDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response<User>> {
    const { user, token } = await this.authService.login(userDto);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      maxAge: 10800,
    });

    return res.status(200).json(user);
  }

  @ApiResponse({ status: 200, type: User })
  @Post('/sign-up')
  async registration(
    @Body() userDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response<User>> {
    const { user, token } = await this.authService.registration(userDto);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: true,
      maxAge: 10800,
    });

    return res.status(200).json(user);
  }
}
