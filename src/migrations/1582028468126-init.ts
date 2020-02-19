import {MigrationInterface, QueryRunner} from "typeorm";

export class init1582028468126 implements MigrationInterface {
    name = 'init1582028468126'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "manufacturer" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "phone" character varying NOT NULL, "siret" integer NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a4687de45b74542072a2656b77d" UNIQUE ("name"), CONSTRAINT "PK_81fc5abca8ed2f6edc79b375eeb" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "owner" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "purchase_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "car_id" integer, CONSTRAINT "UQ_1edb5a8c7210a79e24e7ea74a59" UNIQUE ("name"), CONSTRAINT "PK_8e86b6b9f94aece7d12d465dc0c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "car" ("id" SERIAL NOT NULL, "price" integer NOT NULL, "discountPercent" integer NOT NULL DEFAULT 0, "first_registration_date" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "manufacturer_id" integer, CONSTRAINT "PK_55bbdeb14e0b1d7ab417d11ee6d" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "owner" ADD CONSTRAINT "FK_0379b14df9547845007051aab88" FOREIGN KEY ("car_id") REFERENCES "car"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "car" ADD CONSTRAINT "FK_b04564d061f113e2d060709b026" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "car" DROP CONSTRAINT "FK_b04564d061f113e2d060709b026"`, undefined);
        await queryRunner.query(`ALTER TABLE "owner" DROP CONSTRAINT "FK_0379b14df9547845007051aab88"`, undefined);
        await queryRunner.query(`DROP TABLE "car"`, undefined);
        await queryRunner.query(`DROP TABLE "owner"`, undefined);
        await queryRunner.query(`DROP TABLE "manufacturer"`, undefined);
    }

}
