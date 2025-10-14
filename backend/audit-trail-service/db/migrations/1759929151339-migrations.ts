import { MigrationInterface, QueryRunner } from "typeorm";

export class Db1759929151339 implements MigrationInterface {
    name = 'Db1759929151339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "transaction_confirmation_trace" jsonb`);
        await queryRunner.query(`ALTER TYPE "public"."transactions_confirmation_source_enum" RENAME TO "transactions_confirmation_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_confirmation_source_enum" AS ENUM('alchemy', 'infura', 'graph', 'manual', 'pending_source')`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "confirmation_source" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "confirmation_source" TYPE "public"."transactions_confirmation_source_enum" USING "confirmation_source"::"text"::"public"."transactions_confirmation_source_enum"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "confirmation_source" SET DEFAULT 'pending_source'`);
        await queryRunner.query(`DROP TYPE "public"."transactions_confirmation_source_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_confirmation_source_enum_old" AS ENUM('alchemy', 'infura', 'graph', 'manual')`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "confirmation_source" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "confirmation_source" TYPE "public"."transactions_confirmation_source_enum_old" USING "confirmation_source"::"text"::"public"."transactions_confirmation_source_enum_old"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "confirmation_source" SET DEFAULT 'alchemy'`);
        await queryRunner.query(`DROP TYPE "public"."transactions_confirmation_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transactions_confirmation_source_enum_old" RENAME TO "transactions_confirmation_source_enum"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "transaction_confirmation_trace"`);
    }

}
