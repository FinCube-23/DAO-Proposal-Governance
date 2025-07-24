import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../dtos/create-user.dto';
import { Organization } from 'src/organization/entities/organization.entity';

export class UserDetailsDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({ type: () => Organization })
  organization: Organization;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}