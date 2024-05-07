import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
//import { DaoEntity } from './dao/entities/dao.entity';
import { ExchangeUserEntity } from 'src/exchange_user/entities/exchange_user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('mfs_business')
export class MfsBusinessEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar' })
  @ApiProperty()
  name: string;

  @Column({ type: 'varchar', unique: true })
  @ApiProperty()
  org_email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty()
  wallet_address: string;

  @Column({ type: 'varchar' })
  @ApiProperty()
  native_currency: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty()
  certificate: string;

  @Column({ type: 'integer', nullable: true })
  @ApiProperty()
  dao_id: number;
  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

  @OneToMany(
    () => ExchangeUserEntity,
    (exchangeUser) => exchangeUser.mfsBusiness,
    { onDelete: 'CASCADE' }
  )
  exchangeUsers: ExchangeUserEntity[];
}
