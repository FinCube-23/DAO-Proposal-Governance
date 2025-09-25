import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_SERVICE_INSTANCE_ID } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';

const { resourceFromAttributes } = Resource;

const collectorOptions = {
    url: process.env.OTEL_TRACE_COLLECTOR, // url is optional and can be omitted - default is http://localhost:4318/v1/traces
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 10, // an optional limit on the number of concurrent requests
};

const traceExporter = new OTLPTraceExporter(collectorOptions);

export const otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: "web3-proxy-service",
        [SEMRESATTRS_SERVICE_NAMESPACE]: "web3-proxy-service-api",
        [SEMRESATTRS_SERVICE_VERSION]: "1.0",
        [SEMRESATTRS_SERVICE_INSTANCE_ID]: "1",
    }),
    spanProcessor: new SimpleSpanProcessor(traceExporter),
    instrumentations: [
        new HttpInstrumentation(), 
        new ExpressInstrumentation(), 
        new NestInstrumentation(), 
        new WinstonInstrumentation(),
        new AmqplibInstrumentation()
    ],
});

otelSDK.start();
console.log('OpenTelemetry SDK started for web3-proxy-service');

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
    otelSDK
        .shutdown()
        .then(
            () => console.log('OpenTelemetry SDK shut down successfully'),
            (err) => console.log('Error shutting down OpenTelemetry SDK', err),
        )
        .finally(() => process.exit(0));
});