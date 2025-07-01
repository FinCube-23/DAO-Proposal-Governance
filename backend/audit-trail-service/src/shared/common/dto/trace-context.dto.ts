export class TraceContextDto {
    trace_id: string;
    span_id: string;
    parent_span_id?: string;  // optional, if needed
}