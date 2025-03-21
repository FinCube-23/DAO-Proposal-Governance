import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { maskJSON2, JsonMask2Configs, UuidMaskOptions } from 'maskdata';
const LokiTransport = require('winston-loki');
require('dotenv').config();

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
                winston.format.timestamp(),
                winston.format.printf(({ level, message, timestamp, context }) => {
                    const maskedMessage = this.maskSensitiveData(message);
                    // Ensure the message is stringified
                    return `[${timestamp}] [${context || 'App'}] ${level}: ${maskedMessage}}`;
                })
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ level, message, timestamp, context }) => {
                            const maskedMessage = this.maskSensitiveData(message);
                            return `[${timestamp}] [${context || 'App'}] ${level}: ${maskedMessage}`;
                            //return JSON.stringify(`[${timestamp}] [${context || 'App'}] ${level}: ${JSON.stringify(maskedMessage)}`);
                        })
                    )
                }),
                new winston.transports.File({ filename: 'logs/app.log' }),
                new LokiTransport({
                    host: process.env.LOG_SERVER,
                    labels: { service: "dao-service" },
                    json: true
                })
            ]
        });

    }

    setContext(context: string) {
        this.context = context; // Set module name dynamically
    }

    private generateMaskConfig(data: Record<string, any>): JsonMask2Configs {
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

    private maskSensitiveData(data: any) {
        if (typeof data !== 'object' || data === null) return data; // Ignore non-objects

        const maskConfig = this.generateMaskConfig(data);
        if (Object.keys(maskConfig).length === 0) return data; // No sensitive fields found
        return maskJSON2(data, maskConfig);
    }

    private stringifyMessage(message: any): string {
        if (typeof message === 'object' && message !== null) {
            // Recursively stringify the object
            return JSON.stringify(message, (key, value) =>
                typeof value === 'object' && value !== null ? JSON.stringify(value) : value
            );
        }
        return message;
    }

    log(message: any) {
        const maskedMessage = this.maskSensitiveData(message);

        // Create the log entry with flattened numeric fields
        const logEntry = {
            message: this.stringifyMessage(maskedMessage), // Stringify the message (if needed)
            context: this.context,                        // Add context
            level: 'info',                                // Add log level
        };

        // Log the flattened object
        this.logger.info(logEntry);
    }

    error(message: any, trace?: string) {
        const maskedMessage = this.maskSensitiveData(message);
        this.logger.error({ message: this.stringifyMessage(maskedMessage), trace, context: this.context, level: "error" });
    }

    warn(message: any) {
        const maskedMessage = this.maskSensitiveData(message);
        this.logger.warn({ message: this.stringifyMessage(maskedMessage), context: this.context, level: "warn" });
    }

    debug(message: any) {
        const maskedMessage = this.maskSensitiveData(message);
        this.logger.debug({ message: this.stringifyMessage(maskedMessage), context: this.context, level: "debug" });
    }

    verbose(message: any) {
        const maskedMessage = this.maskSensitiveData(message);
        this.logger.verbose({ message: this.stringifyMessage(maskedMessage), context: this.context, level: "verbose" });
    }
}
