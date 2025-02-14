import * as morgan from 'morgan';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLogger } from './winston-logger';  // Import your custom logger

@Injectable()
export class MorganMiddleware implements NestMiddleware{
    constructor(private readonly logger: WinstonLogger) {}
  
    use(req: Request, res: Response, next: NextFunction) {
      // Custom morgan format
      const customFormat = ':method :url :status :res[content-length] - :response-time ms';
  
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
