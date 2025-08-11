import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753959557706 implements MigrationInterface {
    name = 'Migration1753959557706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Proposal_proposal_type_enum" AS ENUM('membership', 'general')`);
        await queryRunner.query(`CREATE TYPE "public"."Proposal_proposal_status_enum" AS ENUM('pending', 'cancel', 'executed', 'approved')`);
        await queryRunner.query(`CREATE TABLE "Proposal" ("id" SERIAL NOT NULL, "proposal_onchain_id" integer, "proposal_type" "public"."Proposal_proposal_type_enum" NOT NULL DEFAULT 'membership', "metadata" character varying, "proposer_address" character varying NOT NULL, "processed_by" character varying, "proposal_status" "public"."Proposal_proposal_status_enum" NOT NULL DEFAULT 'pending', "trx_hash" character varying NOT NULL, "audit_id" integer, "trx_status" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24e9914bee85956085e18b667c0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Proposal"`);
        await queryRunner.query(`DROP TYPE "public"."Proposal_proposal_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Proposal_proposal_type_enum"`);
    }

}
