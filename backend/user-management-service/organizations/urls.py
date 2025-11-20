from django.urls import path
from organizations.controllers import (
    ProtectedOrganizationController,
    ProtectedOrganizationUserController,
    ProtectedOnchainVerificationController,
)

app_name = "organizations"  # Namespace

urlpatterns = [
    # Organization management - manual ViewSet action mappings
    path(
        "",
        ProtectedOrganizationController.as_view({"get": "get_list", "post": "create"}),
        name="organization-list",
    ),
    path(
        "/update-status",
        ProtectedOrganizationController.as_view({"patch": "change_status"}),
        name="organization-change-status",
    ),
    path(
        "/<int:org_id>",
        ProtectedOrganizationController.as_view(
            {"get": "get_by_id", "patch": "update_organization_info"}
        ),
        name="organization-detail",
    ),
    # Organization users - manual ViewSet action mapping
    path(
        "/users",
        ProtectedOrganizationUserController.as_view(
            {"post": "add_user_to_organization"}
        ),
        name="organization-users",
    ),
    
    path(
        "/<int:org_id>/users",
        ProtectedOrganizationUserController.as_view(
            {"get": "get_organization_users"}
        ),
        name="organization-users-by-org",
    ),
    
    # On-chain verifications
    path(
        "/onchain-verifications",
        ProtectedOnchainVerificationController.as_view(
            {"get": "get_all_verifications"}
        ),
        name="onchain-verifications-list",
    ),
    
    path(
        "/onchain-verifications/<int:verification_id>",
        ProtectedOnchainVerificationController.as_view(
            {"get": "get_verification_by_id"}
        ),
        name="onchain-verification-by-id",
    ),

    path(
        "/<int:org_id>/onchain-verifications",
        ProtectedOnchainVerificationController.as_view(
            {"get": "get_onchain_verifications_by_organization"}
        ),
        name="onchain-verifications-by-org",
    ),
]