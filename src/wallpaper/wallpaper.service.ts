import { Injectable, Logger } from '@nestjs/common';
import {
  IWallpaperProvider,
  WallpaperInfo,
  WallpaperCategory,
  HotSearchItem,
  PaginatedResponse,
} from './interfaces/wallpaper-provider.interface';
import { Wallpaper360Provider } from './providers/wallpaper-360.provider';
import { UnsplashProvider } from './providers/unsplash.provider';
import { PexelsProvider } from './providers/pexels.provider';
import { BingProvider } from './providers/bing.provider';
import { WallpaperProvider } from './dto/query-wallpaper.dto';

@Injectable()
export class WallpaperService {
  private readonly logger = new Logger(WallpaperService.name);
  private readonly providers: Map<string, IWallpaperProvider> = new Map();

  constructor(
    private readonly wallpaper360Provider: Wallpaper360Provider,
    private readonly unsplashProvider: UnsplashProvider,
    private readonly pexelsProvider: PexelsProvider,
    private readonly bingProvider: BingProvider,
  ) {
    // 注册所有壁纸提供者
    this.registerProvider(this.wallpaper360Provider);
    this.registerProvider(this.unsplashProvider);
    this.registerProvider(this.pexelsProvider);
    this.registerProvider(this.bingProvider);
  }

  /**
   * 注册壁纸提供者
   */
  private registerProvider(provider: IWallpaperProvider): void {
    this.providers.set(provider.getProviderName(), provider);
    this.logger.log(`Registered provider: ${provider.getProviderName()}`);
  }

  /**
   * 获取壁纸提供者
   */
  private getProvider(providerName: string): IWallpaperProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return provider;
  }

  /**
   * 获取所有可用的壁纸提供者
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 获取指定提供者的所有壁纸类别
   */
  async getAllCategories(
    providerName: string = WallpaperProvider.WALLPAPER_360,
  ): Promise<WallpaperCategory[]> {
    const provider = this.getProvider(providerName);
    return provider.getAllCategories();
  }

  /**
   * 根据类别获取壁纸列表
   */
  async getWallpapersByCategory(
    providerName: string = WallpaperProvider.WALLPAPER_360,
    cid: number | string = 0,
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    const provider = this.getProvider(providerName);
    return provider.getWallpapersByCategory(cid, start, count);
  }

  /**
   * 搜索壁纸
   */
  async searchWallpapers(
    keyword: string,
    providerName: string = WallpaperProvider.WALLPAPER_360,
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    const provider = this.getProvider(providerName);
    return provider.searchWallpapers(keyword, start, count);
  }

  /**
   * 获取热门搜索关键词
   */
  async getHotSearchKeywords(
    providerName: string = WallpaperProvider.WALLPAPER_360,
  ): Promise<HotSearchItem[]> {
    const provider = this.getProvider(providerName);
    return provider.getHotSearchKeywords();
  }

  /**
   * 聚合多个提供者的壁纸数据
   */
  async aggregateWallpapers(
    providers: string[],
    cid = 'new',
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    const results: WallpaperInfo[] = [];

    for (const providerName of providers) {
      try {
        const provider = this.getProvider(providerName);
        const response = await provider.getWallpapersByCategory(
          cid,
          start,
          count,
        );
        results.push(...response.data);
      } catch (error) {
        this.logger.error(
          `Failed to fetch wallpapers from provider ${providerName}`,
          error,
        );
      }
    }

    // 按创建时间排序
    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      data: results.slice(start, start + count),
      total: results.length,
      page: Math.floor(start / count) + 1,
      pageSize: count,
      hasNext: start + count < results.length,
      hasPrev: start > 0,
    };
  }

  /**
   * 聚合多个提供者的搜索结果
   */
  async aggregateSearchResults(
    keyword: string,
    providers: string[],
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    const results: WallpaperInfo[] = [];

    for (const providerName of providers) {
      try {
        const provider = this.getProvider(providerName);
        const response = await provider.searchWallpapers(keyword, start, count);
        results.push(...response.data);
      } catch (error) {
        this.logger.error(
          `Failed to search wallpapers from provider ${providerName}`,
          error,
        );
      }
    }

    // 按创建时间排序
    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      data: results.slice(start, start + count),
      total: results.length,
      page: Math.floor(start / count) + 1,
      pageSize: count,
      hasNext: start + count < results.length,
      hasPrev: start > 0,
    };
  }
}
