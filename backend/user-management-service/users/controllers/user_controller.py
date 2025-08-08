from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.services import UserService
from users.dtos import UserRegistrationDTO
from users.serializers import (
    UserRegistrationSerializer,
    WalletUpdateSerializer,
    UserResponseSerializer
)
from users.utils.exceptions import (
    EmailAlreadyExistsError,
    UserNotFoundError,
    InvalidWalletAddressError
)
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

class UserRegistrationController(APIView):

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

class WalletController(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = WalletUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user = UserService.update_wallet(
                user=request.user,
                wallet_address=serializer.validated_data['wallet_address']
            )
            return Response({
                'status': 'success',
                'data': {
                    'wallet_address': user.wallet_address,
                    'is_verified': user.is_verified_wallet
                }
            })
        except InvalidWalletAddressError as e:
            return Response({
                'status': 'error',
                'message': str(e),
                'code': 'invalid_wallet'
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)