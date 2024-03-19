import { PartialType } from '@nestjs/mapped-types';
import { CreateMfsBusinessDto } from './create-mfs_business.dto';

export class UpdateMfsBusinessDto extends PartialType(CreateMfsBusinessDto) {}
