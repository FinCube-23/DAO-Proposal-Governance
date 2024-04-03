import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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


  @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
  @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;

}
