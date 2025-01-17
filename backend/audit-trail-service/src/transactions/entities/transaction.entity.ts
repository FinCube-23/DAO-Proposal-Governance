import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transactions')
export class TransactionEntity  {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column({ type: 'varchar', unique: true })
    @ApiProperty()
    trx_hash: string;

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty()
    trx_metadata: string;

    @Column({ type: 'integer', nullable: true })
    @ApiProperty()
    trx_status: number;

    @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;

    @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}