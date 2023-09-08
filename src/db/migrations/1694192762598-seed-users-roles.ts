import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersRoles1694192762598 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "users_roles" (user_id, role_id)
        VALUES (
        (SELECT id FROM "users" WHERE email = 'mockRegularUser@example.com'),
        (SELECT id FROM "role" WHERE value = 'USER')
      );`);

    await queryRunner.query(`
      INSERT INTO users_roles (user_id, role_id)
        VALUES (
        (SELECT id FROM "users" WHERE email = 'mockAdmin@example.com'),
        (SELECT id FROM "role" WHERE value = 'ADMIN')
      );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE "users_roles";');
  }
}
