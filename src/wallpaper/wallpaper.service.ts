import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallpaper } from './entities/wallpaper.entity';
import { PaginationDto } from '../utils/crud/dto/pagination.dto';
@Injectable()
export class WallpaperService {
  constructor(
    @InjectRepository(Wallpaper)
    private wallpaperRepository: Repository<Wallpaper>,
  ) {}

  async findAll(
    pagination: PaginationDto,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: Wallpaper[]; total: number; current: number; pageSize: number }> {
    const { current = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const skip = (current - 1) * pageSize;
    const queryBuilder = this.wallpaperRepository.createQueryBuilder('wallpaper');

    if (startDate && endDate) {
      queryBuilder.where('wallpaper.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // 将驼峰命名转换为下划线命名，以匹配数据库字段
    const dbField = sortBy.replace(/([A-Z])/g, '_$1').toLowerCase();

    const [data, total] = await Promise.all([
      queryBuilder
        .skip(skip)
        .take(pageSize)
        .orderBy(`wallpaper.${dbField}`, sortOrder)
        .getMany(),
      queryBuilder.getCount()
    ]);

    return {
      data,
      total,
      current,
      pageSize
    };
  }

  async findOne(id: string): Promise<Wallpaper> {
    const wallpaper = await this.wallpaperRepository.findOne({ where: { id } });
    if (!wallpaper) {
      throw new NotFoundException(`Wallpaper with ID ${id} not found`);
    }
    return wallpaper;
  }

  async create(wallpaper: Wallpaper): Promise<Wallpaper> {
    return this.wallpaperRepository.save(wallpaper);
  }

  async update(id: string, wallpaper: Partial<Wallpaper>): Promise<Wallpaper> {
    const existingWallpaper = await this.findOne(id);
    const updatedWallpaper = { ...existingWallpaper, ...wallpaper };
    return this.wallpaperRepository.save(updatedWallpaper);
  }

  async remove(id: string): Promise<void> {
    const result = await this.wallpaperRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Wallpaper with ID ${id} not found`);
    }
  }
}