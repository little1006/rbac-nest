import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WallpaperController } from './wallpaper.controller';
import { WallpaperService } from './wallpaper.service';
import { Wallpaper } from './entities/wallpaper.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallpaper])],
  controllers: [WallpaperController],
  providers: [WallpaperService],
  exports: [WallpaperService],
})
export class WallpaperModule {}