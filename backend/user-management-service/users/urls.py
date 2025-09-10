from django.urls import path, include
from users.controllers import (
    ProtectedAuthController,
    PublicAuthController,
    ProtectedUserController,
    PublicUserController,
    
)


app_name = "users"  # Namespace


urlpatterns = [
    path(
        "/update-password",
        ProtectedAuthController.as_view({"post": "update_password"}),
        name="protected-auth",
    ),
    path(
        "/login",
        PublicAuthController.as_view({"post": "login"}),
        name="user-login",
    ),
    path(
        "/register",
        PublicUserController.as_view({"post": "register"}),
        name="user-register",
    ),
    path(
        "/user-list",
        ProtectedUserController.as_view({"get": "get_user_list"}),
        name="user-list",
    ),
    path(
        "/profile",
        ProtectedUserController.as_view({"get": "get_user_detail"}),
        name="user-profile",
    ),
    path(
        "/profile/<int:user_id>",
        ProtectedUserController.as_view({"get": "get_user_detail_by_id"}),
        name="user-details-by-id",
    ),
    path(
        "/profile/update",
        ProtectedUserController.as_view({"patch": "update_user"}),
        name="user-profile-update",
    ),
    path(
        "/profile/update-status/<int:user_id>",
        ProtectedUserController.as_view({"patch": "update_user_status"}),
        name="update_user_status",
    ),
    path(
        "/profile/status/<str:email>",
        ProtectedUserController.as_view({"get": "get_user_status"}),
        name="user-status",
    ),
]
