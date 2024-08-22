import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { DAOEntity } from 'src/voting/entities/dao.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('Proposal')
export class ProposalEntity {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column({ type: 'varchar' })
    @ApiProperty()
    proposer_address: string;

    @Column({ type: 'varchar' })
    @ApiProperty()
    metadata: string;

    @Column({ type: 'boolean', default: false })
    @ApiProperty()
    proposal_status: boolean;

    @Column({ type: 'boolean', default: false })
    @ApiProperty()
    external_proposal: boolean;


    @CreateDateColumn({ name: 'created_at' }) 'created_at': Date;
    @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date;
}
