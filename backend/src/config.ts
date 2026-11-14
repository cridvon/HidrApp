import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const isProd = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET ?? (isProd ? '' : 'dev-secret-solo-desarrollo');

if (!jwtSecret) {
  throw new Error('Falta la variable de entorno JWT_SECRET');
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://localhost:5432/hidrapp',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  jwtSecret,
  jwtExpiresIn: '7d' as const,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
