import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';
import { Role } from '../../roles/roles.entity';
import { Group } from '../../groups/groups.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  roles: Role[];

  @ApiProperty()
  group: Group;

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName || null;
    this.lastName = user.lastName || null;
    this.email = user.email;
    this.roles = user.roles;
    this.group = user.group;
  }
}
