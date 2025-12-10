from django.urls import path
from users.controllers import (
    ProtectedAuthController,
    PublicAuthController,
    ProtectedUserController,
    PublicUserController,
)


app_name = "users"  # Namespace


urlpatterns = [
    path(
        "update-password",
        ProtectedAuthController.as_view({"post": "update_user_password"}),
        name="update-user-password",
    ),
    path(
        "login",
        PublicAuthController.as_view({"post": "login_user"}),
        name="login-user",
    ),
    path(
        "get-new-access-token",
        ProtectedAuthController.as_view({"post": "get_new_access_token"}),
        name="get-new-access-token",
    ),
    path(
        "register",
        PublicUserController.as_view({"post": "register_user"}),
        name="register-user",
    ),
    path(
        "user-list",
        ProtectedUserController.as_view({"get": "get_user_list"}),
        name="user-list",
    ),
    path(
        "profile",
        ProtectedUserController.as_view({"get": "get_user_details"}),
        name="user-profile-details",
    ),
    path(
        "profile/<int:user_id>",
        ProtectedUserController.as_view({"get": "get_user_details_by_id"}),
        name="user-details-by-id",
    ),
    path(
        "profile/update",
        ProtectedUserController.as_view({"patch": "update_user_details"}),
        name="update-user-details",
    ),
    path(
        "update-status",
        ProtectedUserController.as_view({"patch": "update_user_status"}),
        name="update-user-status",
    ),
    path(
        "profile/update-status/<int:user_id>",
        ProtectedUserController.as_view({"patch": "update_user_status_by_id"}),
        name="update-user-status-by-id",
    ),
    path(
        "profile/status/<str:email>",
        ProtectedUserController.as_view({"get": "get_user_status_by_email"}),
        name="user-status",
    ),
]
