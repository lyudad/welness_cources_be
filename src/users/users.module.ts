import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/roles.entity';
import { UserRoles } from '../roles/user-roles.entity';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService],
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, Role, UserRoles]),
    RolesModule,
  ],
})
export class UsersModule {}
