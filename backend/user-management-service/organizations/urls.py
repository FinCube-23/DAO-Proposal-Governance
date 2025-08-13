from django.urls import path
from organizations.controllers import (
    OrganizationListController,
    OrganizationDetailController,
    OrganizationUserController,
    OnchainVerificationController,
)

app_name = 'organizations'  # Namespace

urlpatterns = [
    path('', OrganizationListController.as_view(), name='organization-list'),
    path('<int:org_id>/', OrganizationDetailController.as_view(), name='organization-detail'),
    
    path('users/', 
         OrganizationUserController.as_view({'post': 'add_user_to_organization'}), 
         name='organization-users'),
    
    path('onchain-verifications/', 
         OnchainVerificationController.as_view({'post': 'create'}), 
         name='onchain-verifications-create'),
    path('onchain-verifications/by-organization/<int:org_id>/', 
         OnchainVerificationController.as_view({'get': 'get_onchain_verifications_by_organization'}), 
         name='onchain-verifications-by-org'),
]