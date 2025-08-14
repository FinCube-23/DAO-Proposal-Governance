from django.urls import path
from users.controllers import (
    UserProfileController,
    UserStatusController,
    AuthController,
    PasswordController,
    UserController,
)

app_name = "users"  # Namespace

urlpatterns = [
    path(
        "",
        UserController.as_view({"get": "get_user_list", "post": "register"}),
        name="users-list",
    ),
    path(
        "profile",
        UserProfileController.as_view({"get": "get_user_detail"}),
        name="user-profile",
    ),
    path(
        "profile/update",
        UserProfileController.as_view({"patch": "update_user"}),
        name="user-profile-update",
    ),
    path(
        "profile/status/<str:email>",
        UserStatusController.as_view({"get": "get_user_status"}),
        name="user-status",
    ),
    path(
        "login",
        AuthController.as_view({"post": "login"}),
        name="authentication",
    ),
    path(
        "update-password",
        PasswordController.as_view({"post": "update_password"}),
        name="password",
    ),
]
