import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDatabase1629393037158 implements MigrationInterface {
    name = "CreateDatabase1629393037158";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "constants" ("id" SERIAL NOT NULL, "stornoTime" integer NOT NULL DEFAULT '10000', "crateDeposit" integer NOT NULL DEFAULT '150', "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, CONSTRAINT "PK_b05c708f105d3b8b351fdb07967" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "bottleDepositInCents" integer NOT NULL DEFAULT '0', "stock" integer NOT NULL DEFAULT '0', "priceInCents" integer NOT NULL DEFAULT '0', "description" character varying NOT NULL DEFAULT '', "isDisabled" boolean NOT NULL DEFAULT false, "picture" character varying, "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, "manufacturerId" integer, CONSTRAINT "UQ_22cc43e9a74d7498546e9a63e77" UNIQUE ("name"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "manufacturer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, CONSTRAINT "UQ_a4687de45b74542072a2656b77d" UNIQUE ("name"), CONSTRAINT "PK_81fc5abca8ed2f6edc79b375eeb" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "isSystemUser" boolean NOT NULL DEFAULT false, "isDisabled" boolean NOT NULL DEFAULT false, "balance" integer NOT NULL DEFAULT '0', "password" character varying NOT NULL, "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "amountOfMoneyInCents" integer NOT NULL, "stornoOfTransactionID" character varying, "typeOfTransaction" character varying NOT NULL, "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, "fromUserId" integer, "toUserId" integer, "productId" integer, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "warehouse_transaction" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "pricePerItemInCents" integer NOT NULL, "depositPerItemInCents" integer NOT NULL, "totalInCents" integer NOT NULL, "totalDepositInCents" integer NOT NULL, "withCrate" boolean NOT NULL, "createdAt" character varying NOT NULL, "updatedAt" character varying NOT NULL, "productId" integer, "userId" integer, CONSTRAINT "PK_a48932f8651b1aa7e255f6688f1" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "product_tags_tag" ("productId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_8da52c0bc9255c6cb07af25ac73" PRIMARY KEY ("productId", "tagId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_208235f4a5c925f11171252b76" ON "product_tags_tag" ("productId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_0de90b04710a86601acdff88c2" ON "product_tags_tag" ("tagId") `
        );
        await queryRunner.query(
            `ALTER TABLE "product" ADD CONSTRAINT "FK_da883f8d02581a40e6059bd7b38" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "transaction" ADD CONSTRAINT "FK_54e5bba9459dca68b774dc83afb" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "transaction" ADD CONSTRAINT "FK_edc43668e21d028165c68991e10" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "transaction" ADD CONSTRAINT "FK_fd965536176f304a7dd64937165" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "warehouse_transaction" ADD CONSTRAINT "FK_18e75c3abf28b46f13a61c76c48" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "warehouse_transaction" ADD CONSTRAINT "FK_df22b6e81f4ed3d78e4dcfcb00a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "product_tags_tag" ADD CONSTRAINT "FK_208235f4a5c925f11171252b760" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "product_tags_tag" ADD CONSTRAINT "FK_0de90b04710a86601acdff88c21" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "product_tags_tag" DROP CONSTRAINT "FK_0de90b04710a86601acdff88c21"`
        );
        await queryRunner.query(
            `ALTER TABLE "product_tags_tag" DROP CONSTRAINT "FK_208235f4a5c925f11171252b760"`
        );
        await queryRunner.query(
            `ALTER TABLE "warehouse_transaction" DROP CONSTRAINT "FK_df22b6e81f4ed3d78e4dcfcb00a"`
        );
        await queryRunner.query(
            `ALTER TABLE "warehouse_transaction" DROP CONSTRAINT "FK_18e75c3abf28b46f13a61c76c48"`
        );
        await queryRunner.query(
            `ALTER TABLE "transaction" DROP CONSTRAINT "FK_fd965536176f304a7dd64937165"`
        );
        await queryRunner.query(
            `ALTER TABLE "transaction" DROP CONSTRAINT "FK_edc43668e21d028165c68991e10"`
        );
        await queryRunner.query(
            `ALTER TABLE "transaction" DROP CONSTRAINT "FK_54e5bba9459dca68b774dc83afb"`
        );
        await queryRunner.query(
            `ALTER TABLE "product" DROP CONSTRAINT "FK_da883f8d02581a40e6059bd7b38"`
        );
        await queryRunner.query(`DROP INDEX "IDX_0de90b04710a86601acdff88c2"`);
        await queryRunner.query(`DROP INDEX "IDX_208235f4a5c925f11171252b76"`);
        await queryRunner.query(`DROP TABLE "product_tags_tag"`);
        await queryRunner.query(`DROP TABLE "warehouse_transaction"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "manufacturer"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "constants"`);
    }
}
