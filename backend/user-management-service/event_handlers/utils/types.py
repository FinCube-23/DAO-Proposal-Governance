# utils/types.py
from typing import TypedDict, Literal, Optional
from datetime import datetime

class ValidateAuthorizationDto(TypedDict):
    access_token: str
    options: dict

class ErrorDetails(TypedDict):
    code: str
    message: str
    details: dict

class MessageData(TypedDict):
    db_record_id: int
    current_status: Literal['VALIDATED', 'UNKNOWN']

class MessageResponse(TypedDict):
    status: Literal['SUCCESS', 'FAILED']
    message_id: str
    timestamp: str
    data: MessageData
    error: Optional[ErrorDetails]