// ============================================================================
// Winston Logger — Structured logging with levels
// ============================================================================

import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]${stack ? ` ${stack}` : ` ${message}`}${metaStr}`;
});

const prodFormat = printf(({ level, message, timestamp, ...meta }) => {
  return JSON.stringify({ timestamp, level, message, ...meta });
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  ),
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'production'
          ? prodFormat
          : combine(colorize(), devFormat),
    }),
  ],
  exitOnError: false,
});
