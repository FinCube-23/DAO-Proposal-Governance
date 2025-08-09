from django.urls import path
from users.controllers import (
    UserController,
    WalletController,
)

app_name = 'users'  # Namespace

urlpatterns = [
    path('', UserController.as_view(), name='user-list'),
]