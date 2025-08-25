from rest_framework import status

class EmailAlreadyExistsError(Exception):
    """Raised when a user tries to register with an existing email"""
    def __init__(self):
        self.message = "Email already exists"
        self.code = "email_exists"
        self.status_code = status.HTTP_409_CONFLICT
        super().__init__(self.message)

class UserNotFoundError(Exception):
    """Raised when a user doesn't exist"""
    def __init__(self):
        self.message = "User not found"
        self.code = "user_not_found"
        self.status_code = status.HTTP_404_NOT_FOUND
        super().__init__(self.message)

class InvalidWalletAddressError(Exception):
    """Raised when an invalid wallet address is provided"""
    def __init__(self):
        self.message = "Invalid wallet address"
        self.code = "invalid_wallet"
        self.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        super().__init__(self.message)