import type { NextFunction, Request, Response } from 'express';

export function timeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const controller = new AbortController();

    req.signal = controller.signal;

    const timer = setTimeout(() => {
      controller.abort();

      if (!res.headersSent) {
        return res.status(408).json({
          success: false,
          message: 'Request timeout: Connection timed out',
        });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
