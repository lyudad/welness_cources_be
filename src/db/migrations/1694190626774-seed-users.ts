import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1694190626774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "users" (first_name, last_name, email, password, avatar)
      VALUES ('John', 'Doe', 'mockRegularUser@example.com', '$2a$06$Q3zmKkAoUfwhSrk6iUyQR.noGkIP3nov599qEYHC5PZpTpuocKDV6', 'http://localhost:8080/1694712536708-120204.png');
    `); // email: mockregularUser@example.com && password: 12341234
    await queryRunner.query(`
      INSERT INTO "users" (first_name, last_name, email, password, avatar)
      VALUES ('Illia', 'Lisitsa', 'mockAdmin@example.com', '$2a$06$Q3zmKkAoUfwhSrk6iUyQR.noGkIP3nov599qEYHC5PZpTpuocKDV6', 'http://localhost:8080/1694712452879-221441.png');
    `); // email: mockAdmin@example.com && password: 12341234
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "users" CASCADE;');
  }
}
