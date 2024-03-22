import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dao')
export class DAOEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  token_name: string;

  @Column({ type: 'varchar', nullable: true })
  token_address: string;

  @Column({ type: 'float', nullable: true })
  royalty_amount: number;

  @Column({ type: 'varchar' })
  address: string;
}
