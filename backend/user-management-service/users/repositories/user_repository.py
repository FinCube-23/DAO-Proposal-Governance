# users/repositories/user_repository.py
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, EmptyPage
from users.models import User

class UserRepository:
    
    @classmethod
    def get_user_by_email(cls, email):
        try:
            return User.objects.get(email=email)
        except ObjectDoesNotExist:
            return None

    @classmethod
    def create_user(cls, user_dto):
        return User.objects.create_user(
            email=user_dto.email,
            first_name=user_dto.first_name,
            last_name=user_dto.last_name,
            contact_number=user_dto.contact_number,
            password=user_dto.password
        )

    @classmethod
    def update_wallet_address(cls, user_id, wallet_address):
        user = User.objects.get(id=user_id)
        user.wallet_address = wallet_address
        user.save()
        return user

    @staticmethod
    def get_users(page, limit, filters):
        queryset = User.objects.filter(**filters).order_by('-date_joined')
        paginator = Paginator(queryset, limit)
        
        try:
            return (
                list(paginator.page(page).object_list.values()),  # Serialized data
                {'page': page, 'limit': limit, 'total': paginator.count}
            )
        except EmptyPage:
            raise Exception("Page not found")