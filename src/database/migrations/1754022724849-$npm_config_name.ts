import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1754022724849 implements MigrationInterface {
  name = ' $npmConfigName1754022724849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "courses" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "instructor" character varying NOT NULL, "topics" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "thubmnail_image" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "courses"`);
  }
}
