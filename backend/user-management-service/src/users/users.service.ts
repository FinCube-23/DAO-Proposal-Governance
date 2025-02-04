import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    console.log(">>>>>>>email: ", email);

    return this.userRepository.findOne({
      where: { email },
      relations: ['mfsBusiness', 'exchangeUser'],
    });
  }

  async create(user: User) {
    return this.userRepository.save(user);
  }
}
