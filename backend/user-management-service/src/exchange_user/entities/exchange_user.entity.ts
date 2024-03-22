import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MfsBusinessEntity } from 'src/mfs_business/entities/mfs_business.entity';

@Entity('exchange_user')
export class ExchangeUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @ManyToOne(
    () => MfsBusinessEntity,
    (mfsBusiness) => mfsBusiness.exchangeUsers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'mfs_id' })
  mfsBusiness: MfsBusinessEntity;

  @Column({ type: 'float' })
  balance: number;

  //@ManyToOne(() => UserEntity, (user) => user.exchangeUsers)
  // @JoinColumn({ name: 'user_id' })
  //user: UserEntity;
}
