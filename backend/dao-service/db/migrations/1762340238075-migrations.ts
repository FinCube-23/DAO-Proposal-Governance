import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1762340238075 implements MigrationInterface {
    name = 'Migrations1762340238075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Proposal" ("id" SERIAL NOT NULL, "proposal_onchain_id" integer, "proposal_type" "public"."Proposal_proposal_type_enum" NOT NULL DEFAULT 'membership', "description" character varying, "event_logs" character varying, "proposer_address" character varying NOT NULL, "proposal_status" "public"."Proposal_proposal_status_enum" NOT NULL DEFAULT 'pending', "transaction_hash" character varying NOT NULL, "transaction_status" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_006894ec47cc33bc0159fe6f169" UNIQUE ("transaction_hash"), CONSTRAINT "PK_24e9914bee85956085e18b667c0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Proposal"`);
    }

}
