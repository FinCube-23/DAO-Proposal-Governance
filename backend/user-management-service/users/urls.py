from django.urls import path
from users.controllers import (
    UserController,
    UserProfileController,
    PasswordController,
    AuthController,
    UserStatusController,
)

app_name = "users"  # Namespace

urlpatterns = [
    path("", UserController.as_view(), name="user-list"),
    path("<int:user_id>", UserProfileController.as_view(), name="user-profile"),
    path(
        "profile/update-password/",
        PasswordController.as_view(),
        name="user-password-update",
    ),
    path("login", AuthController.as_view(), name="login"),
    path(
        "profile/status/<str:email>", UserStatusController.as_view(), name="user-status"
    ),
]
