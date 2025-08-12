from django.urls import path
from organizations.controllers import (
    OrganizationListController,
    OrganizationDetailController,
    OrganizationUserController,
    OnchainVerificationController,
    OnchainVerificationByOrganizationController
)

app_name = 'organizations'  # Namespace

urlpatterns = [
    path('', OrganizationListController.as_view(), name='organization-list'),
    path('<int:org_id>/', OrganizationDetailController.as_view(), name='organization-detail'),
    path('users/', OrganizationUserController.as_view(), name='organization-users'),
    path('onchain-verifications/', OnchainVerificationController.as_view(), name='organization-onchain-verifications'),
    path('onchain-verifications/<int:org_id>/', OnchainVerificationByOrganizationController.as_view(), name='organization-onchain-verifications-by-org'),
]