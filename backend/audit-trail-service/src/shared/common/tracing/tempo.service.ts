import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface TempoSpan {
  traceId: string;
  spanId: string;
  operationName: string;
  startTime: number;
  duration: number;
  tags: Record<string, any>;
  logs: Array<any>;
  serviceName: string;
}

export interface ServiceStatus {
  service: string;
  status: 'completed' | 'failed';
  timestamp: string;
}

@Injectable()
export class TempoService {
  private readonly logger = new Logger(TempoService.name);
  private readonly tempoUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.tempoUrl = process.env.TEMPO_URL || 'http://tempo:3200';
  }

  async getTraceById(traceId: string): Promise<any> {
    try {
      const url = `${this.tempoUrl}/api/traces/${traceId}`;
      this.logger.log(`Fetching trace from Tempo: ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
          },
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch trace ${traceId} from Tempo: ${error.message}`);
      throw error;
    }
  }

  async getServiceFlow(traceId: string): Promise<TempoSpan[]> {
    const trace = await this.getTraceById(traceId);
    
    if (!trace || !trace.batches) {
      this.logger.warn(`No trace batches found for trace ${traceId}`);
      return [];
    }

    const spans = trace.batches.flatMap(batch => {
      const batchServiceName = batch.resource?.attributes?.find(attr => attr.key === 'service.name')?.value?.stringValue || 'unknown';
      
      return batch.scopeSpans?.flatMap(scopeSpan =>
        scopeSpan.spans?.map(span => {
          const spanAttributes = this.extractAttributes(span.attributes);
          
          let serviceName = batchServiceName;
          
          if (spanAttributes['messaging.destination']) {
            const destination = spanAttributes['messaging.destination'];
            serviceName = destination.replace(/-exchange$/, '').replace(/-consumer$/, '');
          }
          
          if (spanAttributes['http.target'] || spanAttributes['http.url']) {
            const target = spanAttributes['http.target'] || spanAttributes['http.url'];
            const serviceMatch = target.match(/\/\/([^:\/]+)/);
            if (serviceMatch) {
              serviceName = serviceMatch[1];
            }
          }
          
          if (spanAttributes['peer.service']) {
            serviceName = spanAttributes['peer.service'];
          }

          if (spanAttributes['db.system'] && spanAttributes['db.name']) {
            serviceName = batchServiceName;
          }

          return {
            traceId: this.bytesToHex(span.traceId),
            spanId: this.bytesToHex(span.spanId),
            operationName: span.name || 'unknown',
            startTime: this.convertToNanoseconds(span.startTimeUnixNano),
            duration: parseInt(span.endTimeUnixNano) - parseInt(span.startTimeUnixNano),
            tags: spanAttributes,
            logs: span.events || [],
            serviceName: serviceName,
          };
        }) || []
      ) || [];
    });

    this.logger.log(`Extracted ${spans.length} spans for trace ${traceId}`);
    
    const serviceDistribution = spans.reduce((acc, span) => {
      acc[span.serviceName] = (acc[span.serviceName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.logger.log(`Service distribution: ${JSON.stringify(serviceDistribution)}`);
    
    return spans;
  }

  async extractServiceStatus(traceId: string): Promise<ServiceStatus[]> {
    try {
      const spans = await this.getServiceFlow(traceId);

      if (!spans || spans.length === 0) {
        this.logger.warn(`No spans found for trace ${traceId}`);
        return [];
      }

      this.logger.log(`Processing ${spans.length} spans for trace ${traceId}`);
      
      // Log all unique service names found
      const uniqueServices = [...new Set(spans.map(s => s.serviceName))];
      this.logger.log(`Unique services in trace: ${uniqueServices.join(', ')}`);

      const serviceMap = new Map<string, ServiceStatus>();

      for (const span of spans) {
        const serviceName = span.serviceName;

        // Skip audit-trail-service and unknown services
        if (serviceName === 'audit-trail-service' || serviceName === 'unknown') {
          this.logger.debug(`Skipping service: ${serviceName}`);
          continue;
        }

        const timestamp = new Date(span.startTime / 1_000_000).toISOString();
        const spanFailed = this.isSpanFailed(span);

        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, {
            service: serviceName,
            status: 'completed',
            timestamp: timestamp,
          });
          this.logger.log(`Adding service to map: ${serviceName}`);
        }

        const serviceStatus = serviceMap.get(serviceName);

        if (spanFailed) {
          serviceStatus.status = 'failed';
          this.logger.warn(`Service ${serviceName} marked as failed due to span ${span.spanId}`);
        }

        const spanEndTime = new Date((span.startTime + span.duration) / 1_000_000).toISOString();
        if (spanEndTime > serviceStatus.timestamp) {
          serviceStatus.timestamp = spanEndTime;
        }
      }
      
      const result = Array.from(serviceMap.values());
      this.logger.log(`Service statuses extracted: ${JSON.stringify(result, null, 2)}`);
      this.logger.log(`Extracted ${result.length} service statuses from trace ${traceId}`);

      return result;
    } catch (error) {
      this.logger.error(`Error extracting service status for trace ${traceId}: ${error.message}`);
      this.logger.error(error.stack);
      return [];
    }
  }

  private isSpanFailed(span: TempoSpan): boolean {
    const tags = span.tags;

    if (tags['error'] === true || tags['error'] === 'true') {
      return true;
    }

    const httpStatusCode = tags['http.status_code'] || tags['http.response.status_code'];
    if (httpStatusCode && parseInt(httpStatusCode) >= 400) {
      return true;
    }

    const otelStatus = tags['otel.status_code'];
    if (otelStatus === 'ERROR' || otelStatus === 2) {
      return true;
    }

    if (tags['status.code'] === 2 || tags['status.code'] === 'ERROR') {
      return true;
    }

    return false;
  }

  private extractAttributes(attributes: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    if (!attributes) return result;

    attributes.forEach(attr => {
      const value = attr.value?.stringValue 
        || attr.value?.intValue 
        || attr.value?.boolValue 
        || attr.value?.doubleValue;
      
      if (value !== undefined) {
        result[attr.key] = value;
      }
    });

    return result;
  }

  private bytesToHex(bytes: string | Uint8Array): string {
    if (typeof bytes === 'string') {
      return bytes;
    }
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private convertToNanoseconds(timeValue: string | number): number {
    if (typeof timeValue === 'number') {
      return timeValue;
    }
    return parseInt(timeValue);
  }

  async waitForTraceAvailability(
    traceId: string,
    maxRetries: number = 3,
    retryDelayMs: number = 1000,
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const spans = await this.getServiceFlow(traceId);
        if (spans && spans.length > 0) {
          this.logger.log(`Trace ${traceId} available after ${attempt} attempts`);
          return true;
        }
      } catch (error) {
        this.logger.warn(`Attempt ${attempt}/${maxRetries}: Trace ${traceId} not available`);
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    this.logger.warn(`Trace ${traceId} not available after ${maxRetries} attempts`);
    return false;
  }
}