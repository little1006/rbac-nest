import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log(
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    process.env.DB_HOST,
    process.env.DB_PORT,
    process.env.DB_DATABASE,
  );
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 9999;
  // 配置 CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'chrome-extension://*', // 允许所有 Chrome Extension
      /^chrome-extension:\/\/.+$/, // 使用正则表达式匹配 Chrome Extension
      'https://little077-quantum-admin-7cxqk7jbc-jinghaoyuan382-1400s-projects.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // 自动剔除未定义在 DTO 中的属性
      forbidNonWhitelisted: false, // 如果传入了未定义的属性，抛出错误
      transform: false, // 自动转换参数类型
    }),
  );

  await app.listen(port);
  console.log(`\n🚀 Application is running on: http://127.0.0.1:${port}\n`);
}
bootstrap();
