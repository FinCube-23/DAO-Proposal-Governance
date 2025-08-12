from django.urls import path
from organizations.controllers import (
    OrganizationListController,
    OrganizationDetailController
)

app_name = 'organizations'  # Namespace

urlpatterns = [
    path('', OrganizationListController.as_view(), name='organization-list'),
    path('<int:org_id>/', OrganizationDetailController.as_view(), name='organization-detail'),
]