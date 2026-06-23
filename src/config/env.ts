import { z } from 'zod'

/**
 * Zod-validated environment. Fails loudly at startup if a required var is
 * missing or malformed, so we never ship a broken config silently.
 */
const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('Botola Go'),
  VITE_API_BASE_URL: z.string().url().default('https://api.botolago.app/v1'),
  VITE_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables — see console for details.')
}

export const env = {
  appName: parsed.data.VITE_APP_NAME,
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
  useMocks: parsed.data.VITE_USE_MOCKS,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}

export type Env = typeof env
