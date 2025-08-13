from organizations.models import OrganizationUser

class OrganizationUserRepository:

    @classmethod
    def create_organization_user(cls, user_id, organization_id):
        return OrganizationUser.objects.create(user_id=user_id, organization_id=organization_id)