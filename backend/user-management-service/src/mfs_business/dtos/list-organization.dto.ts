import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OnChainProposalStatus } from '../entities/mfs_business.entity';

export class ListOrganizationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @ApiProperty({ required: false, enum: OnChainProposalStatus })
  @IsEnum(OnChainProposalStatus)
  @IsOptional()
  status?: OnChainProposalStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;
}