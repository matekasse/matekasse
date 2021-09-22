import {MigrationInterface, QueryRunner} from "typeorm";

export class addCurrencySymbolConstant1632332574939 implements MigrationInterface {
    name = 'addCurrencySymbolConstant1632332574939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."constants" ADD "currencySymbol" character varying NOT NULL DEFAULT '€'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."constants" DROP COLUMN "currencySymbol"`);
    }

}
