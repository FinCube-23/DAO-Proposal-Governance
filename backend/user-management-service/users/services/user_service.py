from typing import Optional
from users.repositories import UserRepository
from users.dtos import UserRegistrationDTO, WalletUpdateDTO
from django.core.paginator import Paginator, EmptyPage
from users.utils.exceptions import (
    EmailAlreadyExistsError,
    InvalidWalletAddressError,
    UserNotFoundError
)

class UserService:
    
    @staticmethod
    def register_user(user_dto: UserRegistrationDTO):
        if UserRepository.get_user_by_email(user_dto.email):
            raise EmailAlreadyExistsError()
        
        user = UserRepository.create_user(user_dto)
        # Send verification email logic here
        return user

    @staticmethod
    def get_users(query_params):
        # Validate and parse parameters
        page = int(query_params.get('page', 1))
        limit = int(query_params.get('limit', 10))
        
        if page < 1 or limit < 1:
            raise Exception("Page and limit must be positive numbers")
        
        # Prepare filters
        filters = {}
        if 'status' in query_params:
            filters['status'] = query_params['status']
        if 'is_active' in query_params:
            filters['is_active'] = query_params['is_active'].lower() == 'true'
        if 'is_staff' in query_params:
            filters['is_staff'] = query_params['is_staff'].lower() == 'true'
        
        # Delegate to repository
        return UserRepository.get_users(page, limit, filters)

    @staticmethod
    def update_wallet(wallet_dto: WalletUpdateDTO):
        user = UserRepository.get_user_by_id(wallet_dto.user_id)
        if not user:
            raise UserNotFoundError()
        
        if not wallet_dto.wallet_address.startswith('0x'):
            raise InvalidWalletAddressError()
            
        return UserRepository.update_wallet_address(
            wallet_dto.user_id,
            wallet_dto.wallet_address
        )
