export const HOST = 'https://oss.quantumdash.link';
export const isProd = process.env.NODE_ENV !== 'development';
//三方天气接口,获取24小时的天气
export const weatherUrl =
  'https://nn4nmqpat5.re.qweatherapi.com/v7/weather/24h';
export const weatherCityUrl =
  'https://nn4nmqpat5.re.qweatherapi.com/geo/v2/city/lookup';
export const PRIVATEKEY = process.env.PRIVATEKEY;
