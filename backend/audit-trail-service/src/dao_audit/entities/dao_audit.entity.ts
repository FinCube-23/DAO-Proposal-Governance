import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn  } from 'typeorm';

@Entity('dao_transaction')
export class DaoAudit {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', unique: true })
    trx_hash: string;

    @Column({ type: 'varchar' })
    trx_sender: string;
  
    @Column({ type: 'integer', nullable: true })
    trx_status: number;

    @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;

    @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
