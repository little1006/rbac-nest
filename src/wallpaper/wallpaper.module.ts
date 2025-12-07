import { Module } from '@nestjs/common';
import { WallpaperController } from './wallpaper.controller';
import { WallpaperService } from './wallpaper.service';
import { Wallpaper360Provider } from './providers/wallpaper-360.provider';
import { UnsplashProvider } from './providers/unsplash.provider';
import { PexelsProvider } from './providers/pexels.provider';
import { BingProvider } from './providers/bing.provider';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [WallpaperController],
  providers: [
    WallpaperService,
    Wallpaper360Provider,
    UnsplashProvider,
    PexelsProvider,
    BingProvider,
  ],
  exports: [WallpaperService],
})
export class WallpaperModule {} 