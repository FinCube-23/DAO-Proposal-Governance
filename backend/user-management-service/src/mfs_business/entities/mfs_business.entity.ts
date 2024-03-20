import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
//import { DaoEntity } from './dao/entities/dao.entity';
import { ExchangeUserEntity } from 'src/exchange_user/entities/exchange_user.entity';

@Entity('mfs_business')
export class MfsBusinessEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  org_email: string;

  @Column({ type: 'varchar' })
  wallet_address: string;

  @Column({ type: 'varchar' })
  native_currency: string;

  @Column({ type: 'varchar' })
  certificate: string;

  //@ManyToOne(() => DaoEntity, (dao) => dao.businesses)
  // @JoinColumn({ name: 'dao_id' })
  //dao: DaoEntity;

  @OneToMany(
    () => ExchangeUserEntity,
    (exchangeUser) => exchangeUser.mfsBusiness,
  )
  exchangeUsers: ExchangeUserEntity[];
}
