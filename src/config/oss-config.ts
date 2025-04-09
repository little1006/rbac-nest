import { join } from 'path';
import * as OSS from 'ali-oss';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env.development') });

// OSS配置
export const ossConfig = {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    secure: true
};


// 创建OSS客户端
export const ossClient = new OSS(ossConfig);
export async function getAssumeRole(name: string, timeout: number = 3600) {
    const sts = new OSS.STS({
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,  // 从环境变量中获取RAM用户的AccessKey ID
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET // 从环境变量中获取RAM用户的AccessKey Secret
    })
    const result = await sts.assumeRole(process.env.OSS_STS_ROLE_ARN, '', timeout, name);
    return result
}
// 生成不同尺寸的图片URL
export function generateImageUrls(ossPath: string, originalWidth: number, originalHeight: number) {
    const baseUrl = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${ossPath}`;

    return {
        raw: baseUrl,
        full: `${baseUrl}?x-oss-process=image/resize,w_${originalWidth},h_${originalHeight}`,
        regular: `${baseUrl}?x-oss-process=image/resize,w_1080`,
        small: `${baseUrl}?x-oss-process=image/resize,w_400`,
        thumb: `${baseUrl}?x-oss-process=image/resize,w_200`,
        small_s3: `${baseUrl}?x-oss-process=image/resize,w_160`
    };
}

// 上传图片到OSS
export async function uploadImageToOSS(imagePath: string, ossPath: string) {
    try {
        const result = await ossClient.put(ossPath, imagePath);
        return result.url;
    } catch (error) {
        console.error('上传图片到OSS失败:', error);
        throw error;
    }
}