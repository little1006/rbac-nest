import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, Query } from '@nestjs/common';
import { WallpaperService } from './wallpaper.service';
import { Wallpaper } from './entities/wallpaper.entity';
import { PaginationDto } from '../utils/crud/dto/pagination.dto';

@Controller('wallpapers')
export class WallpaperController {
  constructor(private readonly wallpaperService: WallpaperService) {}

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: Wallpaper[]; total: number; current: number; pageSize: number }> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.wallpaperService.findAll(pagination, start, end);
  }

  @Get('preview-access-key')
  async previewAccessKey(): Promise<any> {
    return this.wallpaperService.getPrevwAccessKey();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Wallpaper> {
    return this.wallpaperService.findOne(id);
  }

  @Post()
  async create(@Body() wallpaper: Wallpaper): Promise<Wallpaper> {
    return this.wallpaperService.create(wallpaper);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() wallpaper: Partial<Wallpaper>,
  ): Promise<Wallpaper> {
    return this.wallpaperService.update(id, wallpaper);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.wallpaperService.remove(id);
  }
}