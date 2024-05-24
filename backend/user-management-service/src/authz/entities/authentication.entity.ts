import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MfsBusinessEntity } from 'src/mfs_business/entities/mfs_business.entity';

@Entity('Authentication')
export class AuthenticationEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column({ type: 'varchar' })
    @ApiProperty()
    sub: string;

    @Column({ type: 'varchar' })
    @ApiProperty()
    role: string;

    @OneToOne(() => MfsBusinessEntity, (mfs) => mfs.user)
    mfs: MfsBusinessEntity;
}
