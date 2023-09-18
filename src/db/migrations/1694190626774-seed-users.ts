import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1694190626774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "users" (first_name, last_name, email, password)
      VALUES ('', '', 'mockRegularUser@example.com', '$2a$06$Q3zmKkAoUfwhSrk6iUyQR.noGkIP3nov599qEYHC5PZpTpuocKDV6');
    `); // email: mockregularUser@example.com && password: 12341234
    await queryRunner.query(`
      INSERT INTO "users" (first_name, last_name, email, password)
      VALUES ('', '', 'mockAdmin@example.com', '$2a$06$Q3zmKkAoUfwhSrk6iUyQR.noGkIP3nov599qEYHC5PZpTpuocKDV6');
    `); // email: mockAdmin@example.com && password: 12341234
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "users" CASCADE;');
  }
}
