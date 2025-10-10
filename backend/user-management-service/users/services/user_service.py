from typing import Optional
from users.models import User
from users.repositories import UserRepository
from users.dtos import UserRegistrationDTO, WalletUpdateDTO
from django.core.paginator import Paginator, EmptyPage
from users.utils.exceptions import (
    EmailAlreadyExistsError,
    InvalidWalletAddressError,
    UserNotFoundError,
)
from django.contrib.auth.hashers import make_password, check_password
from logging_config import logger


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
        page = int(query_params.get("page", 1))
        limit = int(query_params.get("limit", 10))

        if page < 1 or limit < 1:
            raise Exception("Page and limit must be positive numbers")

        # Prepare filters
        filters = {}
        if "status" in query_params:
            filters["status"] = query_params["status"]
        if "is_active" in query_params:
            filters["is_active"] = query_params["is_active"].lower() == "true"
        if "is_staff" in query_params:
            filters["is_staff"] = query_params["is_staff"].lower() == "true"

        # Delegate to repository
        return UserRepository.get_users(page, limit, filters)

    @staticmethod
    def get_user_by_id(user_id):
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise Exception("User not found")
        return user

    @staticmethod
    def get_user_with_organizations(user_id):
        return UserRepository.get_user_with_organizations(user_id)

    @staticmethod
    def partial_update(user_id, update_data):
        user = UserRepository.get_user_by_id(user_id)
        
        updated_fields = []
        
        # Check email changes
        if "email" in update_data:
            if update_data["email"] != user.email:
                user.email = update_data["email"]
                user.is_verified_email = False
                updated_fields.extend(["email", "is_verified_email"])
            # If email is the same, don't update it
        
        # Check contact number changes
        if "contact_number" in update_data:
            if str(update_data["contact_number"]) != str(user.contact_number):
                user.contact_number = update_data["contact_number"]
                user.is_verified_contact_number = False
                updated_fields.extend(["contact_number", "is_verified_contact_number"])
            # If contact number is the same, don't update it
        
        # Check wallet address changes
        if "wallet_address" in update_data:
            if update_data["wallet_address"] != user.wallet_address:
                user.wallet_address = update_data["wallet_address"]
                updated_fields.append("wallet_address")
            # If wallet address is the same, don't update it
        
        # Only save if there are actual changes
        if updated_fields:
            user.save(update_fields=updated_fields)
        
        return user

    @staticmethod
    def update_password(user_id, current_password, new_password):
        user = UserRepository.get_user_by_id(user_id)

        if not check_password(current_password, user.password):
            raise Exception("Current password is incorrect")

        user.password = make_password(new_password)
        user.save()
        return user

    @staticmethod
    def get_user_status_by_email(email):
        user = UserRepository.get_user_by_email(email)
        if not user:
            raise Exception("User not found")
        return user

    @staticmethod
    def update_status(user_id: int, approved_by: int, new_status: str):
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise Exception("User not found")

        valid_statuses = [choice[0] for choice in User.STATUS_CHOICES]
        if new_status not in valid_statuses:
            raise Exception(
                f"Invalid status: {new_status}. Must be one of {valid_statuses}"
            )

        user.status = new_status
        user.approved_by_id = approved_by  # We are getting this from JWT token.
        # update is_active based on status(rejected,banned)
        if new_status == "approved":
            user.is_active = True
        elif new_status in ("rejected", "banned"):
            user.is_active = False
        user.save(update_fields=["status", "is_active", "approved_by_id"])
        return user
