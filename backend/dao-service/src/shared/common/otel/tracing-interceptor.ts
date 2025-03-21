import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import api, { trace } from '@opentelemetry/api';
import { WinstonLogger } from '../logger/winston-logger';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
    private name: string;
    private version: string;
    private tracer: any;
    constructor(private readonly logger: WinstonLogger) {
        this.name = 'dao-service';
        this.version = '1.0';
        this.tracer = trace.getTracer(this.name, this.version);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // Retrieve the active OpenTelemetry span
        const activeSpan = api.trace.getSpan(api.context.active());
        const spanContext = activeSpan.spanContext();
        const beforeMessage = 'TracingInterceptor: Request handling initiated for span: ' + JSON.stringify(spanContext);

        if (activeSpan) {
            activeSpan.addEvent(beforeMessage);
        }
        this.logger.log(beforeMessage);
        const span = this.tracer.startSpan("Trace Started");

        // Continue with the request handling and log after processing is complete
        return next.handle().pipe(
            tap(() => {
                const afterMessage = 'TracingInterceptor: Request handling completed';
                if (activeSpan) {
                    activeSpan.addEvent(afterMessage);
                }
                this.logger.log(afterMessage);
                span.end();

            })
        );
    }
}
