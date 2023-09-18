import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userDto: CreateUserDto): Promise<{ user: User; token: string }> {
    const user = await this.validateUser(userDto);

    if (!user) throw new NotFoundException('No user with such credentials');

    const { token } = await this.generateToken(user);

    return { user, token };
  }

  async registration(
    userDto: CreateUserDto,
  ): Promise<{ user: User; token: string }> {
    const [existingUser] = await this.userService.findByEmail(userDto.email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 6);

    const newUser = await this.userService.createUser({
      ...userDto,
      password: hashedPassword,
    });
    const { token } = await this.generateToken(newUser);

    return { user: newUser, token };
  }

  async generateToken(user: User): Promise<{ token: string }> {
    const payload = { email: user.email, id: user.id, roles: user.roles };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(userDto: CreateUserDto): Promise<User> {
    const user = await this.userService.findByEmailWithPassword(userDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (!passwordEquals) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async changePassword(
    dto: ChangePasswordDto,
    userId: number,
  ): Promise<boolean> {
    const existingUser =
      await this.userService.findByUserIdWithPassword(userId);

    if (!existingUser) {
      throw new NotFoundException('User with such id not found');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException(
        "Confirm password doesn't equal new password",
      );
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the old one',
      );
    }

    const passwordEquals = await bcrypt.compare(
      dto.currentPassword,
      existingUser.password,
    );

    if (!passwordEquals) {
      throw new UnauthorizedException('Invalid password');
    }

    const newHashedPassword = await bcrypt.hash(dto.newPassword, 6);

    return await this.userService.updatePassword(
      newHashedPassword,
      existingUser.id,
    );
  }
}
