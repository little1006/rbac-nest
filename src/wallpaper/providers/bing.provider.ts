import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  IWallpaperProvider,
  WallpaperInfo,
  WallpaperCategory,
  HotSearchItem,
  PaginatedResponse,
} from '../interfaces/wallpaper-provider.interface';

@Injectable()
export class BingProvider implements IWallpaperProvider {
  private readonly logger = new Logger(BingProvider.name);
  private readonly sourceUrl =
    'https://raw.onmicrosoft.cn/Bing-Wallpaper-Action/main/README.md';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存时间
  private cachedWallpapers: WallpaperInfo[] = [];
  private lastFetchTime = 0;

  constructor(private readonly httpService: HttpService) {}

  getProviderName(): string {
    return 'bing';
  }

  async getAllCategories(): Promise<WallpaperCategory[]> {
    // Bing 壁纸只有一个"每日壁纸"分类
    return [
      {
        id: 'daily',
        name: '每日壁纸',
        description: 'Bing每日精选壁纸',
        provider: this.getProviderName(),
      },
    ];
  }


  /**
   * 从URL中提取语言代码
   * @param url - 壁纸URL
   * @returns 语言代码（如 'ZH-CN', 'JA-JP'）或 null
   */
  private extractLanguageCode(url: string): string | null {
    const match = url.match(/_(JA-JP|ZH-CN|EN-US|[A-Z]{2}-[A-Z]{2})\d+_/i);
    return match ? match[1].toUpperCase() : null;
  }

  /**
   * 判断是否需要刷新缓存
   * 规则：距离上次刷新超过30分钟则需要刷新
   */
  private shouldRefreshCache(): boolean {
    const now = Date.now();

    // 如果没有缓存，需要请求
    if (this.cachedWallpapers.length === 0) {
      return true;
    }

    // 如果距离上次请求超过30分钟，需要刷新
    const timeSinceLastFetch = now - this.lastFetchTime;
    if (timeSinceLastFetch > this.CACHE_DURATION) {
      this.logger.log(
        `Cache expired (${Math.floor(timeSinceLastFetch / 60000)} minutes since last fetch)`,
      );
      return true;
    }

    // 使用缓存
    return false;
  }

  /**
   * 从GitHub抓取Bing壁纸数据
   */
  private async fetchWallpapers(): Promise<WallpaperInfo[]> {
    // 检查是否需要刷新缓存
    if (!this.shouldRefreshCache()) {
      this.logger.log('Using cached Bing wallpapers');
      return this.cachedWallpapers;
    }

    try {
      this.logger.log(`Fetching Bing wallpapers from: ${this.sourceUrl}`);

      const response = await firstValueFrom(
        this.httpService.get(this.sourceUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        }),
      );

      const markdown = response.data;
      const wallpapers: WallpaperInfo[] = [];
      const seenDates = new Set<string>(); // 用于去重

      // 提取今日壁纸标题（可选）
      const todayMatch = markdown.match(/Today:\s*\[([^\]]+)\]/);
      const todayTitle = todayMatch ? todayMatch[1] : null;

      // 1. 首先提取表格内容（在 | Chinese – China | 和下一个表头之间）
      // 只加载中文（ZH-CN）版本的壁纸
      const chineseColumnMatch = markdown.match(
        /\|\s*Chinese\s*–\s*China\s*\|[\s\S]*?\n\|\s*:----:\s*\|[\s\S]*?\n([\s\S]*?)(?=\n\|\s*Chinese|$)/i,
      );

      if (!chineseColumnMatch) {
        this.logger.warn(
          '无法在Bing壁纸数据中找到中文列，请检查源数据格式',
        );
        return this.cachedWallpapers.length > 0 ? this.cachedWallpapers : [];
      }

      const chineseColumnContent = chineseColumnMatch[1];

      // 2. 解析中文列的壁纸数据（只匹配第一列）
      // 匹配格式: | ![日期](缩略图URL) 日期 [download 4k](原图URL)|
      const tableRowRegex =
        /^\|\s*!\[(\d{4}-\d{2}-\d{2})\]\(([^)]+)\)\s*\d{4}-\d{2}-\d{2}\s*\[download 4k\]\(([^)]+)\)\|/gm;

      let match;
      let index = 0;

      while ((match = tableRowRegex.exec(chineseColumnContent)) !== null) {
        const date = match[1]; // 日期 (如: 2025-12-07)
        const thumbUrl = match[2]; // 缩略图URL
        const downloadUrl = match[3]; // 4K原图URL

        // 验证URL是否为中文版本（ZH-CN）
        const langCode = this.extractLanguageCode(downloadUrl);
        if (langCode !== 'ZH-CN') {
          // this.logger.debug(
          //   `Skipping non-Chinese wallpaper (${langCode}): ${date}`,
          // );
          continue;
        }

        // 去重：如果已经存在该日期，跳过
        if (seenDates.has(date)) {
          continue;
        }
        seenDates.add(date);

        // 如果是今天的壁纸,使用提取的标题,否则使用日期作为标题
        const title =
          index === 0 && todayTitle ? todayTitle : `Bing每日壁纸 ${date}`;

        wallpapers.push({
          id: `bing-${date}`,
          title: title,
          description: `${date} Bing每日壁纸`,
          url: downloadUrl,
          thumbUrl: thumbUrl,
          downloadUrl: downloadUrl,
          category: 'daily',
          tags: ['bing', 'daily', date],
          createdAt: new Date(date),
          provider: this.getProviderName(),
        });

        index++;
      }

      this.cachedWallpapers = wallpapers;
      this.lastFetchTime = Date.now();

      this.logger.log(`Fetched ${wallpapers.length} Bing wallpapers`);
      return wallpapers;
    } catch (error) {
      this.logger.error('Failed to fetch Bing wallpapers', error);

      // 如果有缓存,即使过期也返回
      if (this.cachedWallpapers.length > 0) {
        this.logger.warn(
          'Returning stale cached wallpapers due to fetch error',
        );
        return this.cachedWallpapers;
      }

      throw new Error('Failed to fetch Bing wallpapers');
    }
  }

  async getWallpapersByCategory(
    cid: string | number,
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    const wallpapers = await this.fetchWallpapers();
    const paginatedData = wallpapers.slice(start, start + count);

    return {
      data: paginatedData,
      total: wallpapers.length,
      page: Math.floor(start / count) + 1,
      pageSize: count,
      hasNext: start + count < wallpapers.length,
      hasPrev: start > 0,
    };
  }

  async searchWallpapers(
    keyword: string,
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    const wallpapers = await this.fetchWallpapers();

    // 简单的关键词过滤
    const filtered = wallpapers.filter(
      (w) =>
        w.title.toLowerCase().includes(keyword.toLowerCase()) ||
        w.tags?.some((tag) =>
          tag.toLowerCase().includes(keyword.toLowerCase()),
        ),
    );

    const paginatedData = filtered.slice(start, start + count);

    return {
      data: paginatedData,
      total: filtered.length,
      page: Math.floor(start / count) + 1,
      pageSize: count,
      hasNext: start + count < filtered.length,
      hasPrev: start > 0,
    };
  }

  async getHotSearchKeywords(): Promise<HotSearchItem[]> {
    // Bing壁纸没有搜索功能,返回空数组
    return [];
  }

  /**
   * 强制刷新缓存（用于调试或手动更新）
   */
  async refreshCache(): Promise<void> {
    this.logger.log('Force refreshing Bing wallpapers cache...');
    this.lastFetchTime = 0; // 重置最后请求时间
    await this.fetchWallpapers();
  }

  /**
   * 获取缓存信息（用于调试）
   */
  getCacheInfo(): {
    cached: number;
    lastFetch: Date | null;
    shouldRefresh: boolean;
  } {
    return {
      cached: this.cachedWallpapers.length,
      lastFetch: this.lastFetchTime > 0 ? new Date(this.lastFetchTime) : null,
      shouldRefresh: this.shouldRefreshCache(),
    };
  }
}
