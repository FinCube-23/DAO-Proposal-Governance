import { Test, TestingModule } from '@nestjs/testing';
import { MfsBusinessController } from './mfs_business.controller';
import { MfsBusinessService } from './mfs_business.service';

describe('MfsBusinessController', () => {
  let controller: MfsBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MfsBusinessController],
      providers: [MfsBusinessService],
    }).compile();

    controller = module.get<MfsBusinessController>(MfsBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
