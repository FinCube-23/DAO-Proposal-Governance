import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
} from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { WSInstrumentation } from 'opentelemetry-instrumentation-ws';
import { SocketIoInstrumentation } from '@opentelemetry/instrumentation-socket.io';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
require('dotenv').config();

const collectorOptions = {
  url: process.env.OTEL_TRACE_COLLECTOR, // url is optional and can be omitted - default is http://localhost:4318/v1/traces
  headers: {}, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 10, // an optional limit on the number of concurrent requests
};

const traceExporter = new OTLPTraceExporter(collectorOptions);

export const otelSDK = new NodeSDK({
  resource: resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: 'audit-trail-service',
    [SEMRESATTRS_SERVICE_NAMESPACE]: 'audit-service-api',
    [SEMRESATTRS_SERVICE_VERSION]: '1.0',
    [SEMRESATTRS_SERVICE_INSTANCE_ID]: '1',
  }),
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [
    new HttpInstrumentation({
      responseHook: (span, response) => {
        span.setAttributes({
          'http.audit.external_service': 'true',
        });
      },
    }),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new PgInstrumentation(),
    new AmqplibInstrumentation(),
    new WinstonInstrumentation(),
    new GraphQLInstrumentation({
      mergeItems: true,
      responseHook: (span, response) => {
        if (response.errors?.length > 0) {
          span.setAttributes({
            'graphql.audit.has_errors': true,
            'graphql.audit.error_count': response.errors.length,
          });
        }
      },
    }),
    new WSInstrumentation(),
    new SocketIoInstrumentation(),
  ],
});
otelSDK.start();
console.log('OpenTelemetry SDK started');

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
