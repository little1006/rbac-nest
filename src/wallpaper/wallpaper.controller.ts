import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { WallpaperService } from './wallpaper.service';
import {
  QueryWallpaperListDto,
  SearchWallpaperDto,
  GetHotSearchDto,
} from './dto/query-wallpaper.dto';
import { ResService } from '../res/res.service';
import { BusinessException } from '../error-handler/BusinessException';

@Controller('wallpaper')
export class WallpaperController {
  private readonly logger = new Logger(WallpaperController.name);

  constructor(
    private readonly wallpaperService: WallpaperService,
    private readonly resService: ResService,
  ) {}

  /**
   * 获取可用的壁纸提供者列表
   */
  @Get('providers')
  async getAvailableProviders() {
    try {
      const providers = this.wallpaperService.getAvailableProviders();
      return this.resService.success(providers, '获取提供者列表成功');
    } catch (error) {
      this.logger.error('Failed to get available providers', error);
      throw new BusinessException(
        '获取提供者列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取壁纸分类列表
   */
  @Get('categories')
  async getAllCategories(@Query() query: GetHotSearchDto) {
    try {
      const categories = await this.wallpaperService.getAllCategories(
        query.provider,
      );
      return this.resService.success(categories, '获取分类列表成功');
    } catch (error) {
      this.logger.error('Failed to get categories', error);
      throw new BusinessException(
        '获取分类列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 根据分类获取壁纸列表
   */
  @Get('list')
  async getWallpapersByCategory(@Query() query: QueryWallpaperListDto) {
    try {
      const wallpapers = await this.wallpaperService.getWallpapersByCategory(
        query.provider,
        query.cid,
        parseInt(query.start) || 0,
        parseInt(query.count) || 10,
      );
      console.log(query);
      return this.resService.success(wallpapers, '获取壁纸列表成功');
    } catch (error) {
      this.logger.error('Failed to get wallpapers by category', error);
      throw new BusinessException(
        '获取壁纸列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 搜索壁纸
   */
  @Get('search')
  async searchWallpapers(@Query() query: SearchWallpaperDto) {
    console.log(query);
    try {
      if (!query.kw || query.kw.trim() === '') {
        throw new BusinessException(
          '搜索关键词不能为空',
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallpapers = await this.wallpaperService.searchWallpapers(
        query.kw,
        query.provider,
        parseInt(query.start) || 0,
        parseInt(query.count) || 10,
      );
      return this.resService.success(wallpapers, '搜索壁纸成功');
    } catch (error) {
      this.logger.error('Failed to search wallpapers', error);
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        '搜索壁纸失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 获取热门搜索关键词
   */
  @Get('hot-search')
  async getHotSearchKeywords(@Query() query: GetHotSearchDto) {
    try {
      const hotSearchKeywords =
        await this.wallpaperService.getHotSearchKeywords(query.provider);
      return this.resService.success(
        hotSearchKeywords,
        '获取热门搜索关键词成功',
      );
    } catch (error) {
      this.logger.error('Failed to get hot search keywords', error);
      throw new BusinessException(
        '获取热门搜索关键词失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 聚合多个提供者的壁纸数据
   */
  @Post('aggregate')
  async aggregateWallpapers(
    @Body()
    body: {
      providers: string[];
      cid?: string;
      start?: number;
      count?: number;
    },
  ) {
    try {
      const { providers, cid = 'new', start = 0, count = 10 } = body;

      if (!providers || providers.length === 0) {
        throw new BusinessException(
          '提供者列表不能为空',
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallpapers = await this.wallpaperService.aggregateWallpapers(
        providers,
        cid,
        start,
        count,
      );
      return this.resService.success(wallpapers, '聚合壁纸数据成功');
    } catch (error) {
      this.logger.error('Failed to aggregate wallpapers', error);
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        '聚合壁纸数据失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 聚合多个提供者的搜索结果
   */
  @Post('aggregate-search')
  async aggregateSearchResults(
    @Body()
    body: {
      keyword: string;
      providers: string[];
      start?: number;
      count?: number;
    },
  ) {
    try {
      const { keyword, providers, start = 0, count = 10 } = body;

      if (!keyword || keyword.trim() === '') {
        throw new BusinessException(
          '搜索关键词不能为空',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!providers || providers.length === 0) {
        throw new BusinessException(
          '提供者列表不能为空',
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallpapers = await this.wallpaperService.aggregateSearchResults(
        keyword,
        providers,
        start,
        count,
      );
      return this.resService.success(wallpapers, '聚合搜索结果成功');
    } catch (error) {
      this.logger.error('Failed to aggregate search results', error);
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        '聚合搜索结果失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 360壁纸兼容接口 - 获取所有分类
   */
  @Get('360/getAllCategories')
  async get360Categories() {
    try {
      const categories = await this.wallpaperService.getAllCategories('360');
      return this.resService.success(categories, '获取360壁纸分类成功');
    } catch (error) {
      this.logger.error('Failed to get 360 categories', error);
      throw new BusinessException(
        '获取360壁纸分类失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 360壁纸兼容接口 - 获取指定分类的壁纸
   */
  @Get('360/getAppsByCategory')
  async get360WallpapersByCategory(@Query() query: QueryWallpaperListDto) {
    try {
      const wallpapers = await this.wallpaperService.getWallpapersByCategory(
        '360',
        query.cid,
        parseInt(query.start) || 0,
        parseInt(query.count) || 10,
      );
      return this.resService.success(wallpapers, '获取360壁纸列表成功');
    } catch (error) {
      this.logger.error('Failed to get 360 wallpapers by category', error);
      throw new BusinessException(
        '获取360壁纸列表失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 360壁纸兼容接口 - 搜索壁纸
   */
  @Get('360/search')
  async search360Wallpapers(@Query() query: SearchWallpaperDto) {
    try {
      if (!query.kw || query.kw.trim() === '') {
        throw new BusinessException(
          '搜索关键词不能为空',
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallpapers = await this.wallpaperService.searchWallpapers(
        query.kw,
        '360',
        parseInt(query.start) || 0,
        parseInt(query.count) || 10,
      );
      return this.resService.success(wallpapers, '搜索360壁纸成功');
    } catch (error) {
      this.logger.error('Failed to search 360 wallpapers', error);
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException(
        '搜索360壁纸失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 360壁纸兼容接口 - 获取热门搜索
   */
  @Get('360/hotSearch')
  async get360HotSearch() {
    try {
      const hotSearchKeywords =
        await this.wallpaperService.getHotSearchKeywords('360');
      return this.resService.success(hotSearchKeywords, '获取360热门搜索成功');
    } catch (error) {
      this.logger.error('Failed to get 360 hot search', error);
      throw new BusinessException(
        '获取360热门搜索失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Unsplash壁纸接口 - 获取分类列表
   */
  @Get('unsplash/categories')
  async getUnsplashCategories() {
    try {
      const categories = await this.wallpaperService.getAllCategories(
        'unsplash',
      );
      return this.resService.success(categories, '获取Unsplash分类成功');
    } catch (error) {
      this.logger.error('Failed to get Unsplash categories', error);
      throw new BusinessException(
        '获取Unsplash分类失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Unsplash壁纸接口 - 搜索壁纸
   */
  @Get('unsplash/search')
  async searchUnsplashWallpapers(@Query() query: SearchWallpaperDto) {
    try {
      const wallpapers = await this.wallpaperService.searchWallpapers(
        query.kw || 'nature',
        'unsplash',
        parseInt(query.start) || 0,
        parseInt(query.count) || 10,
      );
      return this.resService.success(wallpapers, '搜索Unsplash壁纸成功');
    } catch (error) {
      this.logger.error('Failed to search Unsplash wallpapers', error);
      throw new BusinessException(
        '搜索Unsplash壁纸失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Pexels壁纸接口 - 获取分类列表
   */
  @Get('pexels/categories')
  async getPexelsCategories() {
    try {
      const categories = await this.wallpaperService.getAllCategories('pexels');
      return this.resService.success(categories, '获取Pexels分类成功');
    } catch (error) {
      this.logger.error('Failed to get Pexels categories', error);
      throw new BusinessException(
        '获取Pexels分类失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Pexels壁纸接口 - 搜索壁纸
   */
  @Get('pexels/search')
  async searchPexelsWallpapers(@Query() query: SearchWallpaperDto) {
    try {
      const wallpapers = await this.wallpaperService.searchWallpapers(
        query.kw || 'nature',
        'pexels',
        parseInt(query.start) || 0,
        parseInt(query.count) || 10,
      );
      return this.resService.success(wallpapers, '搜索Pexels壁纸成功');
    } catch (error) {
      this.logger.error('Failed to search Pexels wallpapers', error);
      throw new BusinessException(
        '搜索Pexels壁纸失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Bing壁纸接口 - 获取壁纸列表
   */
  @Get('bing/list')
  async getBingWallpapers(@Query() query: QueryWallpaperListDto) {
    try {
      const wallpapers = await this.wallpaperService.getWallpapersByCategory(
        'bing',
        'daily',
        parseInt(query.start) || 0,
        parseInt(query.count) || 30,
      );
      return this.resService.success(wallpapers, '获取Bing壁纸成功');
    } catch (error) {
      this.logger.error('Failed to get Bing wallpapers', error);
      throw new BusinessException(
        '获取Bing壁纸失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
