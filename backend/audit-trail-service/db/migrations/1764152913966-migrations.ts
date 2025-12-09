import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1764152913966 implements MigrationInterface {
    name = 'Migrations1764152913966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "chain_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "chain_id"`);
    }

}
