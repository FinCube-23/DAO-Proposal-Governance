import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { maskJSON2, JsonMask2Configs, UuidMaskOptions } from 'maskdata';
const LokiTransport = require('winston-loki');

@Injectable()
export class WinstonLogger implements LoggerService {
    [x: string]: any;
    private logger: winston.Logger;
    private context = 'Application'; // Default context
    // Define sensitive fields to mask
    private MASK_CONFIG: Partial<JsonMask2Configs> = {
        emailFields: ['email'],
        passwordFields: ['password'],
        phoneFields: ['phone'],
        cardFields: ['creditCard', 'cardNumber', 'wallet'],
        uuidFields: ['uuid'],
        jwtFields: ['jwtToken'],
        stringFields: ['ssn', 'licenseNumber'],
        genericStrings: [
          { config: { maskWith: "*", unmaskedStartCharacters: 4, unmaskedEndCharacters: 2 }, fields: ['trxHash'] },
        ], // This is an object, not an array of strings
      };

    constructor() {
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.json(),
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, context }) => {
                    const maskedMessage = this.maskSensitiveData(message);
                    return `[${timestamp}] [${context || 'App'}] ${level}: ${JSON.stringify(maskedMessage)}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/app.log' }),
                new LokiTransport({
                    host: "http://loki:3100"
                  })
            ]
        });
    }

    setContext(context: string) {
        this.context = context; // Set module name dynamically
    }

    generateMaskConfig(data: Record<string, any>): JsonMask2Configs {
        const config: JsonMask2Configs = {};

        for (const [configKey, fields] of Object.entries(this.MASK_CONFIG)) {
            if (Array.isArray(fields) && fields.every((f) => typeof f === 'string')) {
                const foundFields = fields.filter((field) => {
                    // Make sure `field` is a string before checking if it exists in `data`
                    return typeof field === 'string' && field in data;
                });
    
                if (foundFields.length > 0) {
                    (config as any)[configKey] = foundFields;
                }
            } else if (configKey === 'genericStrings' && Array.isArray(fields)) {
              // Special case for `genericStrings`, which contains objects
              (config as any)[configKey] = fields;
            }
          }
        
          return config;
    }

    maskSensitiveData(data: any) {
        if (typeof data !== 'object' || data === null) return data; // Ignore non-objects

        const maskConfig = this.generateMaskConfig(data);
        if (Object.keys(maskConfig).length === 0) return data; // No sensitive fields found
        return maskJSON2(data, maskConfig);
    }

    log(message: any) {
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
