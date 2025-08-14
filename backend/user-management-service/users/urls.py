from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.controllers import (
    UserProfileController,
    UserStatusController,
    # AuthController,
    # PasswordController,
    UserController,
)

app_name = "users"

router = DefaultRouter()
router.register(r"", UserController, basename="user-list")


urlpatterns = [
    path("", include(router.urls)),
]
