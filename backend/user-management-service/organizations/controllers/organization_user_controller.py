from rest_framework.views import APIView
from rest_framework.response import Response

class OrganizationUserController(APIView):
    def create(self, request):
        """
        Handle creation of organization user.
        in -> user_id, organization_id
        out -> organization_user data
        """
        # Implementation logic goes here
        return Response({"message": "Organization user created"})