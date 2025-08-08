"""
URL configuration for user_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.http import HttpResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

def welcome_view(request):
    return HttpResponse(
        "<h1>Welcome to USER-MANAGEMENT-SERVICE node! &#x1F680;</h1>"
        "<p>API Documentation:</p>"
        "<ul>"
        "<li><a href='/api/docs/'>Swagger UI</a></li>"
        "<li><a href='/api/redoc/'>ReDoc</a></li>"
        "</ul>",
        content_type="text/html; charset=utf-8"
    )

urlpatterns = [
    path('', welcome_view, name='welcome'),  # Root URL
    path('admin/', admin.site.urls),
    # Schema URLs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Redoc
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
