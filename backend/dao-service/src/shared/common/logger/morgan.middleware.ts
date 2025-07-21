import * as morgan from 'morgan';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLogger } from './winston-logger';  // Import your custom logger

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLogger) { }

  use(req: Request, res: Response, next: NextFunction) {
    const customFormat = (tokens: any, req: Request, res: Response) => {
      // Create a log object with numeric fields as numbers
      const logData = {
        timestamp: new Date().toISOString(),
        method: tokens.method(req, res),
        url: req.url,
        status_code: parseInt(tokens.status(req, res)), // Convert to number
        response_time_ms: parseFloat(tokens['response-time'](req, res)), // Convert to number
        content_length: parseInt(tokens['res'](req, res, 'content-length') || 0), // Convert to number
        content_type: req.get('Content-Type'),
        user_agent: req.get('User-Agent'),
        referer: req.get('Referer'),
        client_ip: req.get('X-Real-IP') || req.ip,
        forwarded_for: req.get('X-Forwarded-For'),
        request_id: req.headers['x-request-id'] || '',
      };

      // Return the log object (let the logger handle stringification)
      return logData;
    };

    // Using morgan with the custom format
    morgan((tokens, req, res) => {
      const logData = customFormat(tokens, req, res);
      // Log the message with your custom WinstonLogger
      if (this.logger) {
        this.logger.log(logData); // Pass the object directly
      } else {
        console.error('Logger not available');
      }
    })(req, res, next); // Call the morgan middleware with the request/response
  }
}