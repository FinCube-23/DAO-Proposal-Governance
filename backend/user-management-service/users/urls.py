from django.urls import path
from users.controllers import (
    UserController,
    UserProfileController,
)

app_name = 'users'  # Namespace

urlpatterns = [
    path('', UserController.as_view(), name='user-list'),
    path('<int:user_id>', UserProfileController.as_view(), name='user-profile'),
]