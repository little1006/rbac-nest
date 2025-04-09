import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWallpapersTable1744116282172 implements MigrationInterface {
    name = 'CreateWallpapersTable1744116282172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallpapers\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`wallpapers\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`wallpapers\` DROP COLUMN \`alt_description\``);
        await queryRunner.query(`ALTER TABLE \`wallpapers\` ADD \`alt_description\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallpapers\` DROP COLUMN \`alt_description\``);
        await queryRunner.query(`ALTER TABLE \`wallpapers\` ADD \`alt_description\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`wallpapers\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`wallpapers\` ADD \`description\` text NULL`);
    }

}
