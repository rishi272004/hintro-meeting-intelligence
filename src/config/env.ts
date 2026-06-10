import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default(isTest ? 'test' : 'development'),
  DATABASE_URL: z
    .string()
    .min(1)
    .default(isTest ? 'postgresql://localhost:5432/hintro_test?schema=public' : ''),
  JWT_SECRET: z
    .string()
    .min(32)
    .default(isTest ? 'test-secret-key-test-secret-key-1234' : ''),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GROQ_API_KEY: z.string().min(1).default(isTest ? 'test-groq-key' : ''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  RESEND_API_KEY: z.string().min(1).default(isTest ? 'test-resend-key' : ''),
  RESEND_FROM_EMAIL: z.string().email().default(isTest ? 'reminders@example.com' : ''),
  APP_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
