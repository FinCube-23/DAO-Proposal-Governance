import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1753435121481 implements MigrationInterface {
    name = 'InitSchema1753435121481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."proposals_onchain_status_enum" AS ENUM('register', 'pending', 'approved', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "proposals" ("id" SERIAL NOT NULL, "trx_hash" character varying(255), "onchain_id" integer, "proposed_wallet" character varying(255) NOT NULL, "context" character varying(255) NOT NULL, "onchain_status" "public"."proposals_onchain_status_enum" DEFAULT 'register', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" integer, CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organizations_status_enum" AS ENUM('banned', 'pending', 'approved', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "type" character varying(255) NOT NULL, "location" character varying(255) NOT NULL, "native_currency" character varying(255) NOT NULL, "certificate" character varying(255), "is_active" boolean NOT NULL DEFAULT false, "status" "public"."organizations_status_enum" DEFAULT 'pending', "approved_by" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9b7ca6d30b94fef571cff876884" UNIQUE ("name"), CONSTRAINT "UQ_4ad920935f4d4eb73fc58b40f72" UNIQUE ("email"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('mfs', 'admin', 'user')`);
        await queryRunner.query(`CREATE TYPE "public"."users_onchain_status_enum" AS ENUM('pending', 'approved', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "is_verified_email" boolean NOT NULL DEFAULT false, "wallet_address" character varying(255), "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "contact_number" character varying(20) NOT NULL, "is_verified_contact" boolean NOT NULL DEFAULT false, "onchain_status" "public"."users_onchain_status_enum" DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_463c7b876dd0e8d3803c72af152" UNIQUE ("contact_number"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exchange_users" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "balance" double precision NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_41f970f9dc0adf3bd344a36866f" UNIQUE ("email"), CONSTRAINT "PK_e93cb9560a84d261ca531d1b8eb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_organizations" ("user_id" integer NOT NULL, "organization_id" integer NOT NULL, CONSTRAINT "PK_f143fa57706c0fb840301ad7049" PRIMARY KEY ("user_id", "organization_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6881b23cd1a8924e4bf61515fb" ON "user_organizations" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9dae16cdea66aeba1eb6f6ddf2" ON "user_organizations" ("organization_id") `);
        await queryRunner.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_53bf810d33fa827848a18c73e20" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_organizations" ADD CONSTRAINT "FK_6881b23cd1a8924e4bf61515fbb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_organizations" ADD CONSTRAINT "FK_9dae16cdea66aeba1eb6f6ddf29" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_organizations" DROP CONSTRAINT "FK_9dae16cdea66aeba1eb6f6ddf29"`);
        await queryRunner.query(`ALTER TABLE "user_organizations" DROP CONSTRAINT "FK_6881b23cd1a8924e4bf61515fbb"`);
        await queryRunner.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_53bf810d33fa827848a18c73e20"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9dae16cdea66aeba1eb6f6ddf2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6881b23cd1a8924e4bf61515fb"`);
        await queryRunner.query(`DROP TABLE "user_organizations"`);
        await queryRunner.query(`DROP TABLE "exchange_users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_onchain_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TYPE "public"."organizations_status_enum"`);
        await queryRunner.query(`DROP TABLE "proposals"`);
        await queryRunner.query(`DROP TYPE "public"."proposals_onchain_status_enum"`);
    }

}
