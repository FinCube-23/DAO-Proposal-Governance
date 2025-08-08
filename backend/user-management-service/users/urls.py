from django.urls import path
from users.controllers import (
    UserRegistrationController,
    WalletController,
)

app_name = 'users'  # Namespace

urlpatterns = [
    path('register/', UserRegistrationController.as_view(), name='user-register'),
    path('wallet/', WalletController.as_view(), name='wallet-update'),
]