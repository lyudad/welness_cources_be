import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';

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
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
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
    const [user] = await this.userService.findByEmail(userDto.email);

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (!user || !passwordEquals) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }
}
