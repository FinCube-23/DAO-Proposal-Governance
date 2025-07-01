import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../dtos/create-user.dto';
import { MfsBusiness } from 'src/mfs_business/entities/mfs_business.entity';

export class UserDetailsDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({ type: () => MfsBusiness })
  organization: MfsBusiness;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}