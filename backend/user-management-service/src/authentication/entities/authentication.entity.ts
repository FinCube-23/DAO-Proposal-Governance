import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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
}
