import { Injectable } from '@nestjs/common';
import { context, trace, SpanContext } from '@opentelemetry/api';
import { TraceContextDto } from '../dto/trace-context.dto';

@Injectable()
export class TraceContextService {
 //Get trace context from Otel

  getCurrentTraceContext(): TraceContextDto {
    const activeSpan = trace.getSpan(context.active());
    const spanContext = activeSpan?.spanContext();

    return {
      trace_id: spanContext?.traceId || 'N/A',
      span_id: spanContext?.spanId || 'N/A',
      parent_span_id: undefined, // Set if needed
    };
  }

  
  extractTraceContext(headers: Record<string, any>): TraceContextDto {
    return {
      trace_id: headers['x-trace-id'] || headers['trace_id'] || 'N/A',
      span_id: headers['x-span-id'] || headers['span_id'] || 'N/A',
      parent_span_id: headers['x-parent-span-id'],
    };
  }

  createTraceHeaders(traceContext?: TraceContextDto): Record<string, string> {
    const ctx = traceContext || this.getCurrentTraceContext();
    return {
      'x-trace-id': ctx.trace_id,
      'x-span-id': ctx.span_id,
      ...(ctx.parent_span_id && { 'x-parent-span-id': ctx.parent_span_id }),
    };
  }

 
  isValidTraceContext(traceContext: TraceContextDto): boolean {
    return (
      traceContext.trace_id !== 'N/A' &&
      traceContext.span_id !== 'N/A' &&
      traceContext.trace_id.length === 32 &&
      traceContext.span_id.length === 16
    );
  }
}