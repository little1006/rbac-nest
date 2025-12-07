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
export class PexelsProvider implements IWallpaperProvider {
  private readonly logger = new Logger(PexelsProvider.name);
  private readonly baseUrl = 'https://api.pexels.com';
  private readonly accessKey =
    'OqTRXvAxd6HcJLShgPONeFJHtJ9vbExlFYXq0uZCa7aKaWCbErF3JPTf';

  constructor(private readonly httpService: HttpService) {}

  getProviderName(): string {
    return 'pexels';
  }

  async getAllCategories(): Promise<WallpaperCategory[]> {
    // Pexels 使用搜索关键词，这里返回一些预设的热门分类
    return [
      { id: 'nature', name: '自然', provider: this.getProviderName() },
      { id: 'wallpapers', name: '壁纸', provider: this.getProviderName() },
      { id: 'landscape', name: '风景', provider: this.getProviderName() },
      { id: 'city', name: '城市', provider: this.getProviderName() },
      { id: 'animals', name: '动物', provider: this.getProviderName() },
      { id: 'ocean', name: '海洋', provider: this.getProviderName() },
      { id: 'mountains', name: '山脉', provider: this.getProviderName() },
      { id: 'forest', name: '森林', provider: this.getProviderName() },
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
      
      const url = `${this.baseUrl}/v1/search`;
      
      this.logger.log(`Fetching Pexels wallpapers: ${url}?query=${query}&page=${page}&per_page=${count}`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            query,
            page,
            per_page: count,
          },
          headers: {
            Authorization: this.accessKey,
          },
        }),
      );

      const data = response.data;
      if (!data.photos || !Array.isArray(data.photos)) {
        throw new Error('Invalid response format');
      }

      const wallpapers: WallpaperInfo[] = data.photos.map((item: any) => ({
        id: item.id.toString(),
        title: item.alt || 'Pexels Image',
        description: item.alt,
        url: item.src.original,
        thumbUrl: item.src.medium,
        downloadUrl: item.src.original,
        width: item.width,
        height: item.height,
        category: query,
        tags: [],
        createdAt: new Date(),
        provider: this.getProviderName(),
      }));

      return {
        data: wallpapers,
        total: data.total_results || wallpapers.length,
        page,
        pageSize: count,
        hasNext: data.next_page !== undefined,
        hasPrev: data.prev_page !== undefined,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Pexels wallpapers', error);
      throw new Error('Failed to fetch Pexels wallpapers');
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
    // Pexels 没有热门搜索接口，返回预设的热门关键词
    const hotKeywords = [
      'nature',
      'city',
      'animals',
      'technology',
      'food',
      'travel',
      'architecture',
      'people',
      'abstract',
      'minimal',
    ];

    return hotKeywords.map((keyword, index) => ({
      keyword,
      rank: index + 1,
      provider: this.getProviderName(),
    }));
  }
}

