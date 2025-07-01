export class EventMessageDto {
    event_name: string;
    published_at: Date;
    publisher_service: string;
}

export class MessageDto {
    messageId: string;
    correlationId: string;
}