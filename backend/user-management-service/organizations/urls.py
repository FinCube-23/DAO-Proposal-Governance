from django.urls import path
from organizations.controllers import (
    OrganizationController,
    OrganizationUserController,
    OnchainVerificationController,
)

app_name = 'organizations'  # Namespace

urlpatterns = [
    # Organization management - manual ViewSet action mappings
    path('', 
         OrganizationController.as_view({'get': 'get_list', 'post': 'create'}), 
         name='organization-list'),
    path('<int:org_id>/', 
         OrganizationController.as_view({'get': 'get_by_id', 'patch': 'update_organization_info'}), 
         name='organization-detail'),
    
    # Organization users - manual ViewSet action mapping
    path('users/', 
         OrganizationUserController.as_view({'post': 'add_user_to_organization'}), 
         name='organization-users'),
    
    # Onchain verifications - manual ViewSet action mappings
    path('onchain-verifications/', 
         OnchainVerificationController.as_view({'post': 'create'}), 
         name='onchain-verifications-create'),
    path('onchain-verifications/by-organization/<int:org_id>/', 
         OnchainVerificationController.as_view({'get': 'get_onchain_verifications_by_organization'}), 
         name='onchain-verifications-by-org'),
]