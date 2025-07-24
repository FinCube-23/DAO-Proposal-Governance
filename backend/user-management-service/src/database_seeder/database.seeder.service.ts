import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ExchangeUser } from 'src/exchange_user/entities/exchange_user.entity';
import { Organization } from 'src/organization/entities/organization.entity';

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectRepository(ExchangeUser)
    private exchangeUserRepository: Repository<ExchangeUser>,
    @InjectRepository(Organization)
    private mfsBusinessRepository: Repository<Organization>,
  ) {}

  async seed(): Promise<void> {
    const exchangeUsers = await this.readSeedDataFromFile(
      'exchange_users.json',
    );
    const mfsBusinesses = await this.readSeedDataFromFile(
      'organization.json',
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
