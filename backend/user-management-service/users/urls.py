from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.controllers import (
    UserProfileController,
    AuthController,
    PasswordController,
    UserController,
)


app_name = "users"  # Namespace

urlpatterns = [
    path(
        "",
        UserController.as_view({"get": "get_user_list", "post": "register"}),
        name="user-list",
    ),
]
