import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ExchangeUserEntity } from 'src/exchange_user/entities/exchange_user.entity';
import { MfsBusinessEntity } from 'src/mfs_business/entities/mfs_business.entity';

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectRepository(ExchangeUserEntity)
    private exchangeUserRepository: Repository<ExchangeUserEntity>,
    @InjectRepository(MfsBusinessEntity)
    private mfsBusinessRepository: Repository<MfsBusinessEntity>,
  ) {}

  async seed(): Promise<void> {
    const exchangeUsers = await this.readSeedDataFromFile(
      'exchange_users.json',
    );
    const mfsBusinesses = await this.readSeedDataFromFile(
      'mfs_businesses.json',
    );
    const authentication = await this.readSeedDataFromFile(
      'authentication.json',
    );

    await this.mfsBusinessRepository.save(mfsBusinesses);
    await this.exchangeUserRepository.save(exchangeUsers);
  }

  private async readSeedDataFromFile(fileName: string): Promise<any[]> {
    const filePath = path.join(`./src/database_seeder/${fileName}`);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const seedData = JSON.parse(fileContent);
    return seedData;
  }
}
