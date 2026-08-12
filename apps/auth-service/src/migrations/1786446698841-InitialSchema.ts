import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1786446698841 implements MigrationInterface {
    name = 'InitialSchema1786446698841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // uuid_generate_v4() below comes from uuid-ossp, which managed Postgres
        // (Neon, Render, RDS) ships but does not enable on a fresh database.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'restaurant_owner', 'driver', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."users_ownerapplicationstatus_enum" AS ENUM('none', 'pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "isActive" boolean NOT NULL DEFAULT true, "isEmailVerified" boolean NOT NULL DEFAULT false, "isAvailable" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "emailVerificationExpires" TIMESTAMP WITH TIME ZONE, "passwordResetToken" character varying, "passwordResetExpires" TIMESTAMP WITH TIME ZONE, "ownerApplicationStatus" "public"."users_ownerapplicationstatus_enum" NOT NULL DEFAULT 'none', "businessName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7ad75a333a7bcf6a2b5d3517ca" ON "users" ("emailVerificationToken") `);
        await queryRunner.query(`CREATE INDEX "IDX_bffe933a388d6bde48891ff95a" ON "users" ("passwordResetToken") `);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bffe933a388d6bde48891ff95a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ad75a333a7bcf6a2b5d3517ca"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_ownerapplicationstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
