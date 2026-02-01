import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAnalyticsEventsTable1738500000000 implements MigrationInterface {
  name = 'CreateAnalyticsEventsTable1738500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'analytics_events',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'event_type',
            type: 'varchar',
            length: '50',
            comment: '事件类型',
          },
          {
            name: 'event_name',
            type: 'varchar',
            length: '100',
            comment: '事件名称',
          },
          {
            name: 'event_id',
            type: 'varchar',
            length: '36',
            comment: '事件唯一ID',
          },
          {
            name: 'timestamp',
            type: 'bigint',
            comment: '事件时间戳',
          },
          {
            name: 'device_id',
            type: 'varchar',
            length: '50',
            comment: '设备ID',
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '100',
            comment: '会话ID',
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '用户ID',
          },
          {
            name: 'properties',
            type: 'json',
            isNullable: true,
            comment: '事件自定义属性',
          },
          {
            name: 'browser',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '浏览器',
          },
          {
            name: 'browser_version',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '浏览器版本',
          },
          {
            name: 'os',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '操作系统',
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            isNullable: true,
            comment: '语言',
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '时区',
          },
          {
            name: 'screen_resolution',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '屏幕分辨率',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '页面URL',
          },
          {
            name: 'referrer',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '来源页面',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: '页面标题',
          },
          {
            name: 'plugin_version',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: '插件版本',
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: true,
            comment: '事件耗时(ms)',
          },
          {
            name: 'load_time',
            type: 'int',
            isNullable: true,
            comment: '加载时间(ms)',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
          {
            name: 'source',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: '数据来源',
          },
        ],
      }),
      true,
    );

    // 创建索引以优化查询性能
    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_event_type_created',
        columnNames: ['event_type', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_device_created',
        columnNames: ['device_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_user_created',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'analytics_events',
      new TableIndex({
        name: 'IDX_analytics_event_name_created',
        columnNames: ['event_name', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('analytics_events', 'IDX_analytics_event_name_created');
    await queryRunner.dropIndex('analytics_events', 'IDX_analytics_user_created');
    await queryRunner.dropIndex('analytics_events', 'IDX_analytics_device_created');
    await queryRunner.dropIndex('analytics_events', 'IDX_analytics_event_type_created');
    await queryRunner.dropTable('analytics_events');
  }
}
