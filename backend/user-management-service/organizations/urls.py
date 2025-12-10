from django.urls import path
from organizations.controllers import (
    ProtectedOrganizationController,
    ProtectedOrganizationUserController,
    ProtectedOnchainVerificationController,
)

app_name = "organizations"  # Namespace

urlpatterns = [
    # Organization management
    path(
        "",
        ProtectedOrganizationController.as_view({"get": "get_organization_list", "post": "create_new_organization"}),
        name="get-org-list-and-create-new-org",
    ),
    path(
        "update-status",
        ProtectedOrganizationController.as_view({"patch": "update_organization_status"}),
        name="update-org-status",
    ),
    path(
        "<int:org_id>",
        ProtectedOrganizationController.as_view(
            {"get": "get_organization_details_by_id", "patch": "update_organization_details_by_id"}
        ),
        name="get-org-details-by-id-and-update-org-details-by-id",
    ),
    # Organization users
    path(
        "users",
        ProtectedOrganizationUserController.as_view(
            {"post": "add_user_to_organization"}
        ),
        name="add-user-to-org",
    ),
    path(
        "<int:org_id>/users",
        ProtectedOrganizationUserController.as_view({"get": "get_user_list_by_organization_id"}),
        name="get-user-list-by-org-id",
    ),
    # On-chain verifications
    path(
        "onchain-verifications",
        ProtectedOnchainVerificationController.as_view(
            {"get": "get_all_onchain_verification_list"}
        ),
        name="onchain-verifications-list",
    ),
    path(
        "onchain-verifications/<int:verification_id>",
        ProtectedOnchainVerificationController.as_view(
            {"get": "get_onchain_verification_details_by_id"}
        ),
        name="onchain-verification-details-by-id",
    ),
    path(
        "<int:org_id>/onchain-verifications",
        ProtectedOnchainVerificationController.as_view(
            {"get": "get_onchain_verification_list_by_organization_id"}
        ),
        name="onchain-verifications-by-org-id",
    ),
]
