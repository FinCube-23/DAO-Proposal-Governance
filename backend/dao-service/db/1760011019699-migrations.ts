import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1760011019699 implements MigrationInterface {
    name = 'Migrations1760011019699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Proposal" DROP COLUMN "audit_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Proposal" ADD "audit_id" integer`);
    }

}
