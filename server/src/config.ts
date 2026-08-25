import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../.env'
  )
});

const isProduction = process.env.NODE_ENV === 'production';

const required = (
  name: string,
  value: string | undefined
): string => {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const config = {
  port: Number(process.env.PORT || 5000),

  mongo:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/astrocareer',

  jwt: isProduction
    ? required('JWT_SECRET', process.env.JWT_SECRET)
    : process.env.JWT_SECRET || 'local-development-secret-change-me',

  client:
    process.env.CLIENT_URL ||
    'http://localhost:5173',

  aiKey: process.env.AI_API_KEY || '',

  aiModel:
    process.env.AI_MODEL ||
    'gpt-4o-mini',

  astrologyKey:
    process.env.ASTROLOGY_API_KEY || '',

  adminEmail:
    process.env.ADMIN_EMAIL || '',

  adminPassword:
    process.env.ADMIN_PASSWORD || ''
};

export const productionConfig = () => {
  if (!isProduction) {
    return;
  }

  required('MONGODB_URI', process.env.MONGODB_URI);
  required('JWT_SECRET', process.env.JWT_SECRET);
  required('CLIENT_URL', process.env.CLIENT_URL);
};