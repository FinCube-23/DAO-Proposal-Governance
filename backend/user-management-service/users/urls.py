from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.controllers import (
    UserProfileController,
    AuthController,
    PasswordController,
    UserController,
)

app_name = "users"

router = DefaultRouter()
router.register(r"", UserController, basename="user-list")
router.register(r"profile", UserProfileController, basename="user-profile")
router.register(r"", AuthController, basename="auth")
router.register(r"password", PasswordController, basename="password")


urlpatterns = [
    path("", include(router.urls)),
]
