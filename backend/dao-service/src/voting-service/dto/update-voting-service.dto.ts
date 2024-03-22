import { PartialType } from '@nestjs/mapped-types';
import { CreateVotingServiceDto } from './create-voting-service.dto';

export class UpdateVotingServiceDto extends PartialType(CreateVotingServiceDto) {}
