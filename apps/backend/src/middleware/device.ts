import { BadRequestError } from '@src/shared/errors';
import { logger } from '@src/shared/logger';
import type { NextFunction, Request, Response } from 'express';

export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type DeviceOS = 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown';
export type DeviceBrowser = 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Opera' | 'IE' | 'Unknown';

export interface DeviceInfo {
  type: DeviceType;
  os: DeviceOS;
  browser: DeviceBrowser;
  version: string;
}

function parseUserAgent(ua: string): DeviceInfo {
  const lower = ua.toLowerCase();

  let type: DeviceType = 'desktop';
  if (/android/.test(lower) && /phone/.test(lower)) type = 'phone';
  else if (/android/.test(lower)) type = 'tablet';
  else if (/ipad|tablet|playbook|silk/.test(lower)) type = 'tablet';
  else if (/iphone|ipod/.test(lower)) type = 'phone';
  else if (/windows phone/.test(lower)) type = 'phone';

  let os: DeviceOS = 'Unknown';
  if (/windows nt/.test(lower)) os = 'Windows';
  else if (/mac os x/.test(lower) && !/(iphone|ipod|ipad)/.test(lower)) os = 'macOS';
  else if (/android/.test(lower)) os = 'Android';
  else if (/(iphone|ipod|ipad)/.test(lower)) os = 'iOS';
  else if (/(cros|linux)/.test(lower)) os = 'Linux';

  let browser: DeviceBrowser = 'Unknown';

  let version = '';

  const match = ua.match(
    /(Edg|Edge|OPR|Opera|Chrome|Firefox|Safari|MSIE|Trident)\s*[/\s](\d+(?:\.\d+)*)/,
  );
  if (match) {
    const name = match[1];
    version = match[2];
    if (/Edge|Edg/.test(name)) browser = 'Edge';
    else if (/OPR|Opera/.test(name)) browser = 'Opera';
    else if (name === 'Chrome') browser = 'Chrome';
    else if (name === 'Firefox') browser = 'Firefox';
    else if (name === 'Safari' && !/chrome/.test(lower)) browser = 'Safari';
    else if (/MSIE|Trident/.test(name)) browser = 'IE';
  }

  return { type, os, browser, version };
}

export function deviceMiddleware(req: Request, _res: Response, next: NextFunction) {
  const traceId = (req.traceId as string) || '';
  const ua = req.headers['user-agent'] || '';
  const deviceTypeHeader = req.headers['x-device-type'] as string | undefined;

  if (deviceTypeHeader && deviceTypeHeader !== 'phone') {
    logger.warn({ traceId, deviceTypeHeader, agent: ua }, 'Invalid x-device-type');
    throw new BadRequestError(`Invalid device`);
  }

  const parsed = parseUserAgent(ua);

  if (deviceTypeHeader === 'phone') {
    parsed.type = 'phone';
  }

  logger.info(
    { traceId, type: parsed.type, os: parsed.os, browser: parsed.browser, version: parsed.version },
    'middleware/device - Request started',
  );
  req.device = parsed;
  next();
}
