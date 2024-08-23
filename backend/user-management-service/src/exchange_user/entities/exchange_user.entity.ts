import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { MfsBusinessEntity } from 'src/mfs_business/entities/mfs_business.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('exchange_user')
export class ExchangeUserEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', unique: true })
  @ApiProperty()
  email: string;

  @Column({type: 'int', nullable: false})
  @ApiProperty()
  mfs_id: number;

  @Column({ type: 'float' })
  @ApiProperty()
  balance: number;

  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

  //@ManyToOne(() => UserEntity, (user) => user.exchangeUsers)
  // @JoinColumn({ name: 'user_id' })
  //user: UserEntity;
}