import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TraceContextService } from './trace-context.service';
import { TempoService } from './tempo.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [TraceContextService, TempoService],
  exports: [TraceContextService, TempoService],
})
export class TracingModule {}