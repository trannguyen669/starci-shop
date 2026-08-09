import 'dotenv/config';//đọc file .env và đưa các biến trong đó vào process.env

import { envSchema, type Env } from './env.schema';

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(process.env);
  //lấy toàn bộ biến môi trường trong process.env rồi đưa vào envSchema.safeParse để kiểm tra

  if (!parsed.success) {
    console.error(
      'Invalid environment:',
      parsed.error.issues,
    );

    process.exit(1);
  }

  cached = parsed.data;

  return cached;
}