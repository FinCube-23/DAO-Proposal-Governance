import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1760708011949 implements MigrationInterface {
    name = 'Migrations1760708011949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_confirmation_source_enum" AS ENUM('alchemy', 'infura', 'graph', 'manual', 'pending_source')`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "confirmation_source" "public"."transactions_confirmation_source_enum" DEFAULT 'pending_source'`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_trx_status_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "trx_status" "public"."transactions_trx_status_enum" NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "trace_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "trace_id"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "trx_status"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_trx_status_enum"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "confirmation_source"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_confirmation_source_enum"`);
    }

}
