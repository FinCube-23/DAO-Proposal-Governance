from dataclasses import dataclass
from typing import Optional
from phonenumber_field.phonenumber import PhoneNumber

@dataclass
class UserRegistrationDTO:
    email: str
    first_name: str
    last_name: str
    contact_number: PhoneNumber
    password: str

@dataclass
class WalletUpdateDTO:
    user_id: int
    wallet_address: str

@dataclass
class UserResponseDTO:
    id: int
    email: str
    first_name: str
    last_name: str
    is_verified: bool