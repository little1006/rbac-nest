import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { WallpaperService } from '../src/wallpaper/wallpaper.service';
import * as fs from 'fs';
import * as path from 'path';
import { uploadImageToOSS, generateImageUrls } from './oss-config';

export async function importWallpapers() {
    try {
        // 初始化NestJS应用
        const app = await NestFactory.createApplicationContext(AppModule);
        const wallpaperService = app.get(WallpaperService);

        // 读取wallpaper_json_data目录下的所有JSON文件
        const jsonDataDir = path.join(__dirname, '../../wallpaper_json_data');
        const imagesDir = path.join(__dirname, '../../wallpaper_images');
        console.log(`读取${jsonDataDir}目录下的所有JSON文件...`);
        if (!fs.existsSync(jsonDataDir) || !fs.existsSync(imagesDir)) {
            console.error('wallpaper_json_data或wallpaper_images目录不存在！');
            await app.close();
            return;
        }

        const jsonFiles = fs.readdirSync(jsonDataDir).filter(file => file.endsWith('.json'))
        console.log(`找到${jsonFiles.length}个JSON文件...`);
        // 批量导入数据
        let successCount = 0;
        let errorCount = 0;

        for (const jsonFile of jsonFiles) {
            const jsonPath = path.join(jsonDataDir, jsonFile);
            const wallpaper = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const imageFile = path.join(imagesDir, `${wallpaper.id}.jpg`);

            if (!fs.existsSync(imageFile)) {
                console.error(`图片文件不存在: ${wallpaper.id}.jpg`);
                errorCount++;
                continue;
            }

            // 上传图片到OSS
            const ossPath = `wallpapers/${wallpaper.id}.jpg`;
            await uploadImageToOSS(imageFile, ossPath);

            // 生成新的图片URL
            const { width, height } = wallpaper;
            wallpaper.urls = generateImageUrls(ossPath, width, height);
            try {
                // 确保必要的日期字段是Date对象
                wallpaper.created_at = wallpaper.created_at ? new Date(wallpaper.created_at) : new Date();
                wallpaper.updated_at = wallpaper.updated_at ? new Date(wallpaper.updated_at) : new Date();
                wallpaper.promoted_at = wallpaper.promoted_at ? new Date(wallpaper.promoted_at) : new Date();

                // 确保user对象中的日期字段也是Date对象
                if (wallpaper.user) {
                    wallpaper.user.updated_at = new Date(wallpaper.user.updated_at);
                }

                // 确保_metadata中的日期字段是Date对象
                if (wallpaper._metadata) {
                    wallpaper._metadata.saved_at = new Date(wallpaper._metadata.saved_at);
                }
                console.log(wallpaper)
                await wallpaperService.create(wallpaper);
                successCount++;
                console.log(`成功上传图片并导入壁纸: ${wallpaper.id}`);
            } catch (error) {
                errorCount++;
                console.error(`导入壁纸失败 ${wallpaper.id}:`, error.message);
            }
        }

        console.log('\n导入完成！');
        console.log(`成功: ${successCount}`);
        console.log(`失败: ${errorCount}`);

        await app.close();
    } catch (error) {
        console.error('导入过程发生错误:', error);
        process.exit(1);
    }
}

