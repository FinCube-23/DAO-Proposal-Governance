import * as morgan from 'morgan';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLogger } from './winston-logger';  // Import your custom logger

@Injectable()
export class MorganMiddleware implements NestMiddleware{
    constructor(private readonly logger: WinstonLogger) {}
  
    use(req: Request, res: Response, next: NextFunction) {
      // Custom morgan format
      // const customFormat = ':method :url :status :res[content-length] - :response-time ms';

      const customFormat = (tokens: any, req: Request, res: Response) => {
        // Capture relevant fields in JSON format
        return JSON.stringify({
          timestamp: new Date().toISOString(),
          method: tokens.method(req, res),
          url: tokens.url(req, res),
          status_code: tokens.status(req, res),
          response_time_ms: tokens['response-time'](req, res),
          content_length: tokens['res'](req, res, 'content-length'),
          user_agent: req.get('User-Agent'),  // Capture the User-Agent header
          referer: req.get('Referer'),        // Capture the Referer header (if available)
          request_id: req.headers['x-request-id'] || '',  
        });
      };
  
      // Using morgan with the custom format
      morgan(customFormat, {
        stream: {
          write: (message: string) => {
            // Log the message with your custom WinstonLogger
            if (this.logger) {
              this.logger.log(message.trim());
            } else {
              console.error('Logger not available');
            }
          },
        },
      })(req, res, next); // Call the morgan middleware with the request/response
    }
  }
