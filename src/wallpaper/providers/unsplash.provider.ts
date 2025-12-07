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
export class UnsplashProvider implements IWallpaperProvider {
  private readonly logger = new Logger(UnsplashProvider.name);
  private readonly baseUrl = 'https://api.unsplash.com';
  private readonly accessKey = 'vzyaz6SC2Oln5a3NEVmxva-6x9cn3rsQcOkzEqyoL2c';

  constructor(private readonly httpService: HttpService) {}

  getProviderName(): string {
    return 'unsplash';
  }

  async getAllCategories(): Promise<WallpaperCategory[]> {
    // Unsplash 使用主题/集合的概念，这里返回一些预设的热门主题
    return [
      { id: 'nature', name: '自然', provider: this.getProviderName() },
      { id: 'wallpapers', name: '壁纸', provider: this.getProviderName() },
      { id: 'landscape', name: '风景', provider: this.getProviderName() },
      { id: 'architecture', name: '建筑', provider: this.getProviderName() },
      { id: 'abstract', name: '抽象', provider: this.getProviderName() },
      { id: 'minimal', name: '极简', provider: this.getProviderName() },
      { id: 'animals', name: '动物', provider: this.getProviderName() },
      { id: 'ocean', name: '海洋', provider: this.getProviderName() },
    ];
  }

  async getWallpapersByCategory(
    cid: string | number,
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    try {
      const page = Math.floor(start / count) + 1;
      const query = typeof cid === 'string' ? cid : 'nature';
      
      const url = `${this.baseUrl}/search/photos`;
      
      this.logger.log(`Fetching Unsplash wallpapers: ${url}?query=${query}&page=${page}&per_page=${count}`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            query,
            page,
            per_page: count,
          },
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        }),
      );

      const data = response.data;
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format');
      }

      const wallpapers: WallpaperInfo[] = data.results.map((item: any) => ({
        id: item.id,
        title: item.description || item.alt_description || 'Unsplash Image',
        description: item.alt_description,
        url: item.urls.full,
        thumbUrl: item.urls.thumb,
        downloadUrl: item.urls.raw,
        width: item.width,
        height: item.height,
        category: query,
        tags: item.tags?.map((tag: any) => tag.title) || [],
        createdAt: new Date(item.created_at),
        provider: this.getProviderName(),
      }));

      return {
        data: wallpapers,
        total: data.total,
        page,
        pageSize: count,
        hasNext: data.total_pages > page,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Unsplash wallpapers', error);
      throw new Error('Failed to fetch Unsplash wallpapers');
    }
  }

  async searchWallpapers(
    keyword: string,
    start = 0,
    count = 10,
  ): Promise<PaginatedResponse<WallpaperInfo>> {
    return this.getWallpapersByCategory(keyword, start, count);
  }

  async getHotSearchKeywords(): Promise<HotSearchItem[]> {
    // Unsplash 没有热门搜索接口，返回预设的热门关键词
    const hotKeywords = [
      'nature',
      'landscape',
      'city',
      'mountains',
      'ocean',
      'sunset',
      'forest',
      'architecture',
      'minimal',
      'abstract',
    ];

    return hotKeywords.map((keyword, index) => ({
      keyword,
      rank: index + 1,
      provider: this.getProviderName(),
    }));
  }
}

