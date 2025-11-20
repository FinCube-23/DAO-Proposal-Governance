from users.models import User
from users.repositories import UserRepository
from users.dtos import UserRegistrationDTO
from users.utils.exceptions import (
    EmailAlreadyExistsError,
)
from django.contrib.auth.hashers import make_password, check_password


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
        """
        Get paginated list of users with filtering, search, and sorting.
        """
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
        if "is_verified_email" in query_params:
            filters["is_verified_email"] = query_params["is_verified_email"].lower() == "true"
        if "is_verified_contact_number" in query_params:
            filters["is_verified_contact_number"] = query_params["is_verified_contact_number"].lower() == "true"
        
        # Get search parameter
        search = query_params.get("search", "").strip()
        
        # Get sorting parameters
        sort_by = query_params.get("sort_by", "").strip()
        order = query_params.get("order", "desc").strip().lower()
        
        # Validate order parameter
        if order not in ["asc", "desc"]:
            order = "desc"

        # Delegate to repository
        return UserRepository.get_users(
            page,
            limit,
            filters,
            search if search else None,
            sort_by if sort_by else None,
            order
        )

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
    
    @staticmethod
    def change_user_status(user_ids, new_status, approved_by):
        """
        Change user status with validation of allowed transitions.
        Allowed transitions:
        - pending => approved or rejected
        - approved => banned
        - banned => pending
        
        Returns dict with success count and skipped user IDs.
        """
        # Validate new status
        valid_statuses = ['pending', 'approved', 'rejected', 'banned']
        if new_status not in valid_statuses:
            raise Exception(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        # Get all users
        users = UserRepository.get_users_by_ids(user_ids)
        
        if not users.exists():
            raise Exception("No users found with provided IDs")
        
        # Define allowed transitions
        allowed_transitions = {
            'pending': ['approved', 'rejected'],
            'approved': ['banned'],
            'banned': ['pending']
        }
        
        # Filter users based on allowed transitions
        valid_user_ids = []
        skipped_user_ids = []
        
        for user in users:
            current_status = user.status
            
            # Check if transition is allowed
            if current_status in allowed_transitions:
                if new_status in allowed_transitions[current_status]:
                    valid_user_ids.append(user.id)
                else:
                    skipped_user_ids.append(user.id)
            else:
                # Status not in transition map, skip
                skipped_user_ids.append(user.id)
        
        # Perform bulk update for valid users
        updated_count = 0
        if valid_user_ids:
            updated_count = UserRepository.bulk_update_user_status(
                valid_user_ids, new_status, approved_by
            )
        
        return {
            'updated_count': updated_count,
            'updated_ids': valid_user_ids,
            'skipped_ids': skipped_user_ids
        }
