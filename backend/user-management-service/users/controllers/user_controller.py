from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.services import UserService
from users.dtos import UserRegistrationDTO
from users.serializers import (
    UserDetailSerializer,
    UserListSerializer,
    UserRegistrationSerializer,
    UserSelfUpdateSerializer,
    UserResponseSerializer
)
from users.utils.exceptions import (
    EmailAlreadyExistsError
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiTypes, OpenApiParameter

class UserController(APIView):

    @extend_schema(
        request=UserRegistrationSerializer,
        responses={201: UserResponseSerializer}
    )
    def post(self, request):
        registration_serializer = UserRegistrationSerializer(data=request.data)
        registration_serializer.is_valid(raise_exception=True)
        
        try:
            user_dto = UserRegistrationDTO(
                email=registration_serializer.validated_data['email'],
                first_name=registration_serializer.validated_data['first_name'],
                last_name=registration_serializer.validated_data['last_name'],
                contact_number=registration_serializer.validated_data['contact_number'],
                password=registration_serializer.validated_data['password']
            )
            
            user = UserService.register_user(user_dto)
            
            response_serializer = UserResponseSerializer(user)
            
            return Response({
                'status': 'success',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except EmailAlreadyExistsError as e:
            return Response({
                'status': 'error',
                'message': 'Email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                description='Page number',
            ),
            OpenApiParameter(
                name='limit',
                type=OpenApiTypes.INT,
                description='Items per page',
            ),
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                description='Filter by status',
                examples=[
                    OpenApiExample(
                        'Active users',
                        value='active'
                    ),
                ],
            ),
            OpenApiParameter(
                name='is_active',
                type=OpenApiTypes.BOOL,
                description='Filter active users',
            ),
            OpenApiParameter(
                name='is_staff',
                type=OpenApiTypes.BOOL,
                description='Filter staff users',
            ),
        ],
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
    )  
    def get(self, request):
        try:
            users, pagination = UserService.get_users(request.query_params)
            serializer = UserListSerializer(users, many=True)
            return Response({
                'users': serializer.data,
                'pagination': pagination
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class UserProfileController(APIView):

    @extend_schema(
        responses={
            200: UserDetailSerializer,
            404: {"type": "object", "properties": {"error": {"type": "string"}}}
        },
        description="Retrieve a specific user by ID"
    )
    def get(self, request, user_id):
        try:
            user = UserService.get_user_by_id(user_id)
            
            # Serialize response
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND if "not found" in str(e).lower() 
                else status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @extend_schema(
        request=UserSelfUpdateSerializer,
        responses=UserSelfUpdateSerializer
    )
    def patch(self, request, user_id):
        """User self profile update (email/contact/wallet/password)"""
        serializer = UserSelfUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = UserService.partial_update(user_id, serializer.validated_data)
            return Response(UserSelfUpdateSerializer(user).data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )