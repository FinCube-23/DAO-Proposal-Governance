import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1762333690940 implements MigrationInterface {
    name = 'Migrations1762333690940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "trx_hash" character varying NOT NULL, "confirmation_source" "public"."transactions_confirmation_source_enum" DEFAULT 'pending_source', "trx_metadata" character varying, "trx_status" "public"."transactions_trx_status_enum" NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "trace_id" character varying, "transaction_confirmation_trace" jsonb, CONSTRAINT "UQ_85a928ed656ded89eacf951697d" UNIQUE ("trx_hash"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
