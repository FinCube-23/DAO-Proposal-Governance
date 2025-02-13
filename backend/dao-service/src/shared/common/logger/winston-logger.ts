import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLogger implements LoggerService {
    private logger: winston.Logger;
    private context = 'Application'; // Default context

    constructor() {
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, context }) => {
                    return `[${timestamp}] [${context || 'App'}] ${level}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/app.log' })
            ]
        });
    }

    setContext(context: string) {
        this.context = context; // Set module name dynamically
    }

    log(message: string) {
        this.logger.info({ message, context: this.context });
    }

    error(message: string, trace?: string) {
        this.logger.error({ message, trace, context: this.context });
    }

    warn(message: string) {
        this.logger.warn({ message, context: this.context });
    }

    debug(message: string) {
        this.logger.debug({ message, context: this.context });
    }

    verbose(message: string) {
        this.logger.verbose({ message, context: this.context });
    }
}
