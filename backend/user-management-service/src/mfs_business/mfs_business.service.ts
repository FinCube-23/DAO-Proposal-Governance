import { Injectable } from '@nestjs/common';
import { CreateMfsBusinessDto } from './dto/create-mfs_business.dto';
import { UpdateMfsBusinessDto } from './dto/update-mfs_business.dto';

@Injectable()
export class MfsBusinessService {
  create(createMfsBusinessDto: CreateMfsBusinessDto) {
    return 'This action adds a new mfsBusiness';
  }

  findAll() {
    return `This action returns all mfsBusiness`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mfsBusiness`;
  }

  update(id: number, updateMfsBusinessDto: UpdateMfsBusinessDto) {
    return `This action updates a #${id} mfsBusiness`;
  }

  remove(id: number) {
    return `This action removes a #${id} mfsBusiness`;
  }
}
