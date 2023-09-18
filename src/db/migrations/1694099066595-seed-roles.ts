import { MigrationInterface, QueryRunner } from 'typeorm';

export class Roles1694099066595 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "role" ("value", "description")
      VALUES
        ('ADMIN', 'Administrator'),
        ('USER', 'Regular user'),
        ('TRAINER', 'Trainer');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "role" CASCADE;');
  }
}
