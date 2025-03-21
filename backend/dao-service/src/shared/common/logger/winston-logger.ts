import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { maskJSON2, JsonMask2Configs, UuidMaskOptions } from 'maskdata';
const LokiTransport = require('winston-loki');
import { context, trace } from '@opentelemetry/api';

require('dotenv').config();
import * as apiLogs from '@opentelemetry/api-logs';

import {
    BatchLogRecordProcessor,
    LoggerProvider
} from '@opentelemetry/sdk-logs';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport'
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";

//Define the collector endpoint for OTLP
const collectorOptions = {
    url: process.env.OTEL_LOG_COLLECTOR,
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 1, // an optional limit on pending requests
};
const logExporter = new OTLPLogExporter(collectorOptions);
const loggerProvider = new LoggerProvider();

//Ship winston logs to OTEL
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
apiLogs.logs.setGlobalLoggerProvider(loggerProvider);


@Injectable()
export class WinstonLogger implements LoggerService {
    [x: string]: any;
    private logger: winston.Logger;
    private defaultContext = 'Application';  // Default context
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

    private getTraceId(): string {
        const activeSpan = trace.getSpan(context.active());
        return activeSpan ? activeSpan.spanContext().traceId : 'N/A';
    }

    private getSpanId(): string {
        const activeSpan = trace.getSpan(context.active());
        return activeSpan ? activeSpan.spanContext().spanId : 'N/A';
    }

    constructor() {
        this.logger = winston.createLogger({
            // Use a JSON format for better structured logging and correlation
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ level, message, timestamp, context, trace_id, span_id }) => {
                            const maskedMessage = this.maskSensitiveData(message);
                            return `[${timestamp}] [${context || 'App'}] [trace_id=${trace_id}] [span_id=${span_id}] ${level}: ${maskedMessage}`;
                        })
                    )
                }),
                new winston.transports.File({ filename: 'logs/app.log' }),
                new LokiTransport({
                    host: process.env.LOG_SERVER,
                    labels: { job: "dao-service" },
                    format: winston.format.json(),
                    json: true,
                    // The following ensures traceID is correctly derived
                    // for Grafana's trace-to-logs feature
                    batching: false,
                }),
                new OpenTelemetryTransportV3()
            ]
        });
    }

    setContext(context: string) {
        this.defaultContext = context;
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

    private createLogEntry(message: any, level: string, trace?: string, contextValue?: string) {
        const maskedMessage = this.maskSensitiveData(message);
        const traceId = this.getTraceId();
        const spanId = this.getSpanId();

        return {
            message: this.stringifyMessage(maskedMessage),
            context: contextValue || this.defaultContext,
            level: level,
            trace_id: traceId,
            span_id: spanId,
            ...(trace && { error_stack: trace })
        };
    }

    log(message: any, contextValue?: string) {
        this.logger.info(this.createLogEntry(message, 'info', undefined, contextValue));
    }

    error(message: any, trace?: string, contextValue?: string) {
        this.logger.error(this.createLogEntry(message, 'error', trace, contextValue));
    }

    warn(message: any, contextValue?: string) {
        this.logger.warn(this.createLogEntry(message, 'warn', undefined, contextValue));
    }

    debug(message: any, contextValue?: string) {
        this.logger.debug(this.createLogEntry(message, 'debug', undefined, contextValue));
    }

    verbose(message: any, contextValue?: string) {
        this.logger.verbose(this.createLogEntry(message, 'verbose', undefined, contextValue));
    }
}