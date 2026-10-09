import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokensAndRoles1791539982425 implements MigrationInterface {
    name = 'AddRefreshTokensAndRoles1791539982425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "userId" uuid NOT NULL, "tokenHash" character(64) NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_refresh_tokens_token_hash" ON "refresh_tokens"  ("tokenHash") `);
        await queryRunner.query(`CREATE INDEX "idx_refresh_tokens_family_id" ON "refresh_tokens"  ("familyId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying(20) NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP INDEX "public"."idx_refresh_tokens_family_id"`);
        await queryRunner.query(`DROP INDEX "public"."uq_refresh_tokens_token_hash"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    }

}
