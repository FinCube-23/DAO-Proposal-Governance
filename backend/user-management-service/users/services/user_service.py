from users.repositories import UserRepository
from users.dtos import UserRegistrationDTO, WalletUpdateDTO
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

    @staticmethod
    def get_users(page: int = 1, limit: int = 10):
        return UserRepository.get_user_list(page, limit)
