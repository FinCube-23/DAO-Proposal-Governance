import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  MFS = 'mfs',
  ADMIN = 'admin',
  USER = 'user',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'john',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'changeme',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: Role,
    example: 'mfs',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}