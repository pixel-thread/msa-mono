import * as SecureStorage from 'expo-secure-store';
import { AppState, AppStateStatus } from 'react-native';
import { safeStringify } from '../helper/safe-stringify';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';
interface LogContext {
  [key: string]: unknown;
}

interface QueuedLog {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
}

const STORAGE_KEY = '@app_log_queue';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 5000;
const MAX_RETRY_ATTEMPTS = 3;

let isFlushing = false;
let flushTimer: ReturnType<typeof setInterval> | null = null;

// Determine environment safely
const isProduction = !__DEV__;

// Helper to interact with device storage safely
const getStoredLogs = async (): Promise<QueuedLog[]> => {
  try {
    const data = SecureStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLogsToStorage = async (logs: QueuedLog[]) => {
  try {
    SecureStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed writing logs to storage device:', err);
  }
};

const LOG_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const flushClient = async (batch: QueuedLog[]) => {
  if (!LOG_API_BASE_URL) return;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${LOG_API_BASE_URL}/logs/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: batch }),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Server returned status code ${response.status}`);
    }
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

let retryCount = 0;

const flush = async () => {
  if (isFlushing) return;

  const currentQueue = await getStoredLogs();
  if (currentQueue.length === 0) return;

  isFlushing = true;
  const batch = currentQueue.slice(0, BATCH_SIZE);
  const remaining = currentQueue.slice(BATCH_SIZE);

  try {
    await flushClient(batch);
    // Success: Commit the removal of the sent batch from disk
    await saveLogsToStorage(remaining);
    retryCount = 0; // Reset network retry count
  } catch (error) {
    console.warn('Log flush failed:', error);
    retryCount++;

    // Prevent infinite spinning if the endpoint is permanently failing
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.error('Max log retry attempts reached. Dropping current batch to prevent loops.');
      await saveLogsToStorage(remaining); // Drop the bad batch, keep the rest
      retryCount = 0;
    }
  } finally {
    isFlushing = false;
  }
};

const startFlushTimer = () => {
  if (flushTimer) return;
  flushTimer = setInterval(async () => {
    await flush();
  }, FLUSH_INTERVAL_MS);
};

const enqueue = async (level: LogLevel, message: string, context?: LogContext) => {
  // Drop debug profiles or verbose data in production environments
  if (level === 'debug' || !isProduction) return;

  const currentQueue = await getStoredLogs();
  currentQueue.push({
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  });

  await saveLogsToStorage(currentQueue);
  startFlushTimer();

  if (currentQueue.length >= BATCH_SIZE) {
    await flush();
  }
};

// Handle mobile application state cycles (Background / Foreground)
AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
  if (nextAppState === 'background' || nextAppState === 'inactive') {
    // Flush pending changes before the OS freezes background operations
    await flush();
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
  } else if (nextAppState === 'active') {
    // Start syncing again when user comes back
    startFlushTimer();
  }
});

const log = (level: LogLevel, message: string, context?: LogContext) => {
  // Production-safe dev logging format
  if (__DEV__) {
    const formatted = `[${level.toUpperCase()}] ${message}${context ? ` ${safeStringify(context)}` : ''}`;

    if (level === 'error') console.log(formatted);
    else if (level === 'warn') console.log(formatted);
    else console.log(formatted);
  }

  enqueue(level, message, context);
};

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => {
    const safeContext = context ? { ...context } : {};
    if (safeContext.error && safeContext.error instanceof Error) {
      safeContext.error = {
        name: safeContext.error.name,
        message: safeContext.error.message,
        stack: safeContext.error.stack,
      };
    }
    log('error', message, safeContext);
  },
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  flush: () => flush(),
};
