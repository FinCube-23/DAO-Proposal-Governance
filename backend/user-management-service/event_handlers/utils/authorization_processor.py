# utils/authorization_processor.py
import json
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime
from .types import ValidateAuthorizationDto, MessageResponse

def verify_token(token: str, options: dict) -> MessageResponse:
    User = get_user_model()
    
    try:
        # Decode the token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.SIMPLE_JWT.get('ALGORITHM', 'HS256')]
        )

        # Retrieve user from the payload
        user_id = payload.get('user_id')
        if not user_id:
            return build_error_response('Invalid token: missing user_id')
        
        user = User.objects.get(id=user_id)

        # Convert roles to strings (JSON serializable)
        role = [str(perm) for perm in user.groups.values_list('name', flat=True)]
        
        # Ensure all fields are JSON serializable
        return {
            'status': 'SUCCESS',
            'message_id': token[:10] + '...' + token[-10:] if len(token) > 20 else token,
            'timestamp': datetime.utcnow().isoformat(),
            'data': {
                'db_record_id': int(user.id),  # Ensure it's int
                'current_status': 'AUTHENTICATED',
            },
            'user': {
                'id': int(user.id),  # Ensure it's int
                'email': str(user.email),
                'first_name': str(user.first_name) if user.first_name else '',
                'last_name': str(user.last_name) if user.last_name else '',
                'full_name': str(user.get_full_name()) if user.get_full_name() else str(user.email),
                'contact_number': str(user.contact_number) if user.contact_number else None,
                'status': str(user.status),
                'wallet_address': str(user.wallet_address) if user.wallet_address else None,
                'is_active': bool(user.is_active),
                'is_verified_email': bool(user.is_verified_email),
                'is_verified_contact_number': bool(user.is_verified_contact_number),
                'role': role,  # Now list of strings
            },
        }

    except jwt.ExpiredSignatureError:
        return build_error_response('Token has expired')
    except jwt.InvalidTokenError:
        return build_error_response('Invalid token')
    except User.DoesNotExist:
        return build_error_response('User not found')
    except Exception as e:
        return build_error_response(f'Token verification failed: {str(e)}')


def process_authorization_request(body: bytes) -> MessageResponse:
    try:
        data: ValidateAuthorizationDto = json.loads(body)
        return verify_token(data['access_token'], data.get('options', {}))
    except json.JSONDecodeError:
        return build_error_response('Invalid JSON payload')
    except KeyError:
        return build_error_response('Missing access_token field')
    except Exception as e:
        return build_error_response(f'Processing failed: {str(e)}')


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
            'message': str(message),  # Ensure it's string
            'details': {}
        }
    }