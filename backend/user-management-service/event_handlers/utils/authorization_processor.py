# utils/authorization_processor.py
import json
from .types import ValidateAuthorizationDto, MessageResponse
from datetime import datetime

def verify_token(token: str, options: dict) -> MessageResponse:
    """Token verification placeholder (always fails for now)"""
    return {
        'status': 'FAILED',
        'message_id': token,
        'timestamp': datetime.utcnow().isoformat(),
        'data': {
            'db_record_id': 0,
            'current_status': 'UNKNOWN'
        },
        'error': {
            'code': 'AUTH_ERROR',
            'message': 'Token validation not implemented',
            'details': {
                'token_sample': token[:5] + '...',
                'options': options
            }
        }
    }

def process_authorization_request(body: bytes) -> MessageResponse:
    """Process raw RabbitMQ message"""
    try:
        data: ValidateAuthorizationDto = json.loads(body)
        return verify_token(data['access_token'], data.get('options', {}))
        
    except json.JSONDecodeError:
        return build_error_response('Invalid JSON payload')
    except KeyError:
        return build_error_response('Missing access_token field')

def build_error_response(message: str) -> MessageResponse:
    """Standard error response builder"""
    return {
        'status': 'FAILED',
        'message_id': 'unknown',
        'timestamp': datetime.utcnow().isoformat(),
        'data': {
            'db_record_id': 0,
            'current_status': 'UNKNOWN'
        },
        'error': {
            'code': 'PROCESSING_ERROR',
            'message': message,
            'details': {}
        }
    }