import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
//import { DaoEntity } from './dao/entities/dao.entity';
import { ExchangeUserEntity } from 'src/exchange_user/entities/exchange_user.entity';

@Entity('mfs_business')
export class MfsBusinessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  org_email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  wallet_address: string;

  @Column({ type: 'varchar' })
  native_currency: string;

  @Column({ type: 'varchar', nullable: true })
  certificate: string;

  @Column({ type: 'integer', nullable: true })
  dao_id: number;

  //@ManyToOne(() => DaoEntity, (dao) => dao.businesses)
  // @JoinColumn({ name: 'dao_id' })
  //dao: DaoEntity;

  @OneToMany(
    () => ExchangeUserEntity,
    (exchangeUser) => exchangeUser.mfsBusiness,
  )
  exchangeUsers: ExchangeUserEntity[];
}
