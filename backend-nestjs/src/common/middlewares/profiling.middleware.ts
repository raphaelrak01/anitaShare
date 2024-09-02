import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ProfilingMiddleware implements NestMiddleware {
  private logger = new Logger(ProfilingMiddleware.name);

  use(req: Request, res: Response, next: () => void) {
    const startRequestTime = process.hrtime.bigint();
    const requestUrl = req.originalUrl || req.url;

    req['startTime'] = startRequestTime;

    res.on('finish', () => {
      const endRequestTime = process.hrtime.bigint();
      const requestElapsedTime =
        Number(endRequestTime - startRequestTime) / 1e6; // Convert nanoseconds to milliseconds

      this.logger.log(
        `--> Total request ${requestUrl} processing time: ${requestElapsedTime} ms --`,
      );
    });

    next();
  }
}
