import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWallpaperTable1743418370977 implements MigrationInterface {
    name = 'CreateWallpaperTable1743418370977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`wallpapers\` (
            \`id\` varchar(255) NOT NULL,
            \`slug\` varchar(255) NOT NULL,
            \`alternative_slugs\` json NOT NULL,
            \`created_at\` datetime NOT NULL,
            \`updated_at\` datetime NOT NULL,
            \`promoted_at\` datetime NOT NULL,
            \`width\` int NOT NULL,
            \`height\` int NOT NULL,
            \`color\` varchar(255) NOT NULL,
            \`blur_hash\` varchar(255) NOT NULL,
            \`description\` text NULL,
            \`alt_description\` text NOT NULL,
            \`breadcrumbs\` json NOT NULL,
            \`urls\` json NOT NULL,
            \`links\` json NOT NULL,
            \`likes\` int NOT NULL,
            \`liked_by_user\` tinyint NOT NULL,
            \`current_user_collections\` json NOT NULL,
            \`sponsorship\` json NULL,
            \`topic_submissions\` json NOT NULL,
            \`asset_type\` varchar(255) NOT NULL,
            \`user\` json NOT NULL,
            \`_metadata\` json NOT NULL,
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`wallpapers\``);
    }
}