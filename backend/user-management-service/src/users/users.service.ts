import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDetailsDTO } from './dtos/user-details.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // After passport and Auth guard cards are merged this function will be modified to get details of logged user. 
  async findOne(email: string): Promise<UserDetailsDTO> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['mfsBusiness', 'exchangeUser'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.mfsBusiness,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['mfsBusiness', 'exchangeUser'],
    });
  }

  async create(user: User) {
    return this.userRepository.save(user);
  }
}
