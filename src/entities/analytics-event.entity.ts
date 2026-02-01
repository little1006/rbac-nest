import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 埋点事件实体
 */
@Entity('analytics_events')
@Index(['eventType', 'createdAt'])
@Index(['deviceId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['eventName', 'createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========== 事件基础信息 ==========
  @Column({ type: 'varchar', length: 50, comment: '事件类型', name: 'event_type' })
  eventType: string;

  @Column({ type: 'varchar', length: 100, comment: '事件名称', name: 'event_name' })
  eventName: string;

  @Column({ type: 'varchar', length: 36, comment: '事件唯一ID', name: 'event_id' })
  eventId: string;

  @Column({ type: 'bigint', comment: '事件时间戳' })
  timestamp: number;

  // ========== 用户标识 ==========
  @Column({ type: 'varchar', length: 50, comment: '设备ID', name: 'device_id' })
  deviceId: string;

  @Column({ type: 'varchar', length: 100, comment: '会话ID', name: 'session_id' })
  sessionId: string;

  @Column({ type: 'varchar', length: 50, comment: '用户ID', nullable: true, name: 'user_id' })
  userId: string | null;

  // ========== 事件属性 (JSON存储) ==========
  @Column({ type: 'json', comment: '事件自定义属性', nullable: true })
  properties: Record<string, any> | null;

  // ========== 上下文信息 ==========
  @Column({ type: 'varchar', length: 50, comment: '浏览器', nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 20, comment: '浏览器版本', nullable: true, name: 'browser_version' })
  browserVersion: string;

  @Column({ type: 'varchar', length: 50, comment: '操作系统', nullable: true })
  os: string;

  @Column({ type: 'varchar', length: 10, comment: '语言', nullable: true })
  language: string;

  @Column({ type: 'varchar', length: 50, comment: '时区', nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 20, comment: '屏幕分辨率', nullable: true, name: 'screen_resolution' })
  screenResolution: string;

  @Column({ type: 'varchar', length: 500, comment: '页面URL', nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 500, comment: '来源页面', nullable: true })
  referrer: string;

  @Column({ type: 'varchar', length: 200, comment: '页面标题', nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 20, comment: '插件版本', nullable: true, name: 'plugin_version' })
  pluginVersion: string;

  // ========== 性能数据 ==========
  @Column({ type: 'int', comment: '事件耗时(ms)', nullable: true })
  duration: number | null;

  @Column({ type: 'int', comment: '加载时间(ms)', nullable: true, name: 'load_time' })
  loadTime: number | null;

  // ========== 系统字段 ==========
  @CreateDateColumn({ type: 'datetime', comment: '创建时间', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 50, comment: '数据来源', nullable: true })
  source: string;
}
