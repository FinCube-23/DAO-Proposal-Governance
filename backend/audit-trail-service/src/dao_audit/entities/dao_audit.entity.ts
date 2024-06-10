import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity('dao_transaction')
export class DaoAudit {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column({ type: 'varchar', unique: true })
    @ApiProperty()
    trx_hash: string;

    @Column({ type: 'varchar' })
    @ApiProperty()
    trx_sender: string;

    @Column({ type: 'integer', nullable: true })
    @ApiProperty()
    trx_status: number;

    @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;

    @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
