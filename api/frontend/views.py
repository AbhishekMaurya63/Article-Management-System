from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from frontend.models import ArticleViewer
from api.frontend.serializers import ArticleViewerSerializer, ArticleViewerUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from rest_framework import serializers
import random
from api.frontend.serializers import (UserLoginSerializer,
    ChangePasswordSerializer, PasswordResetSerializer, OTPPasswordResetSerializer, 
    PasswordResetWithOTPSerializer, OTPVerificationSerializer
)
# Pagination for article viewers
class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10  # Number of viewers per page
    page_size_query_param = 'page_size'
    max_page_size = 100

# Serializer for the ArticleViewer model
class ArticleViewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleViewer
        fields = '__all__'

# Registration view for ArticleViewer
class ArticleViewerRegistrationView(generics.CreateAPIView):
    serializer_class = ArticleViewerSerializer
    permission_classes = [permissions.AllowAny]  # Allow anyone to register

    @swagger_auto_schema(
        operation_summary="Register a new article viewer",
        request_body=ArticleViewerSerializer,
        responses={201: openapi.Response("Registration successful.", ArticleViewerSerializer),
                   400: "Validation error"}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            viewer = serializer.save()
            return Response({
                'status': 'Success',
                'message': 'Registration successful.',
                'viewer': serializer.data
            }, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            return Response({
                'status': 'Failure',
                'errors': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

# Login view for ArticleViewer
class ArticleViewerLoginView(APIView):
    permission_classes = [permissions.AllowAny]  # Allow anyone to login

    @swagger_auto_schema(
        operation_summary="Login an article viewer",
        request_body=ArticleViewerSerializer,
        responses={200: openapi.Response("Login successful.", ArticleViewerSerializer),
                   400: "Invalid credentials"}
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ArticleViewer List View
class ArticleViewerListView(generics.ListAPIView):
    serializer_class = ArticleViewerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPageNumberPagination

    @swagger_auto_schema(
        operation_summary="List all article viewers",
        responses={200: ArticleViewerSerializer(many=True)},
    )
    def get_queryset(self):
        queryset = ArticleViewer.objects.all().order_by('-date_joined')
        return queryset

# ArticleViewer Detail View (Single Viewer)
class ArticleViewerDetailView(generics.RetrieveAPIView):
    queryset = ArticleViewer.objects.all()
    serializer_class = ArticleViewerSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated viewers can view their details

    @swagger_auto_schema(
        operation_summary="Retrieve an article viewer's details",
        responses={200: ArticleViewerSerializer()},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

# ArticleViewer Update View
class ArticleViewerUpdateView(generics.UpdateAPIView):
    queryset = ArticleViewer.objects.all()
    serializer_class = ArticleViewerUpdateSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Update an article viewer's details",
        responses={200: ArticleViewerUpdateSerializer()},
    )
    def get_object(self):
        return self.request.user  # Allow viewer to update only their own data

    def update(self, request, *args, **kwargs):
        viewer = self.get_object()
        serializer = self.get_serializer(viewer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "Success", "message": "Profile updated successfully!"}, status=status.HTTP_200_OK)
        return Response({"status": "Error", "message": "Failed to update profile.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# ArticleViewer Delete View
class ArticleViewerDeleteView(generics.DestroyAPIView):
    queryset = ArticleViewer.objects.all()
    permission_classes = [permissions.IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Delete an article viewer",
        responses={204: "Viewer deleted successfully.", 403: "Permission denied.", 404: "Viewer not found."},
    )
    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        return Response({
            'message': 'Viewer deleted successfully.'
        }, status=status.HTTP_204_NO_CONTENT)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Change user password",
        request_body=ChangePasswordSerializer,
        responses={200: "Password changed successfully.", 400: "Invalid data or old password mismatch."},
    )
    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            # Check if the old password is correct
            if not user.check_password(old_password):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if the new password matches the old password
            if old_password == new_password:
                return Response({'error': 'New password cannot be the same as the old password.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            return Response({'status': 'Success'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Password Reset Request View
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]  # Anyone can request password reset

    @swagger_auto_schema(
        operation_summary="Request password reset email",
        request_body=PasswordResetSerializer,
        responses={200: openapi.Response("Password reset email sent."), 400: openapi.Response("Invalid data or email not found.")},
    )
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(request)
            return Response({'message': 'Password reset email sent.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Delete User View (Admin only)
class UserDeleteView(generics.DestroyAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = [permissions.IsAdminUser]  # Only admin can delete users

    @swagger_auto_schema(
        operation_summary="Delete a user",
        responses={204: openapi.Response("User deleted successfully."), 403: openapi.Response("Permission denied."), 404: openapi.Response("User not found.")},
    )
    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# Logout View
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Logout a user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token')},
        ),
        responses={200: openapi.Response("Successfully logged out."), 400: openapi.Response("Refresh token is required.")},
    )
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)


# Request OTP for Password Reset
class RequestOTPView(APIView):
    permission_classes = []

    @swagger_auto_schema(
        operation_summary="Request OTP for password reset",
        request_body=OTPPasswordResetSerializer,
        responses={200: openapi.Response("OTP sent to your email."), 400: openapi.Response("User not found or invalid data.")},
    )
    def post(self, request, *args, **kwargs):
        serializer = OTPPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = get_user_model().objects.get(email=email)
            except get_user_model().DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

            # Generate a random OTP (6 digits)
            otp = str(random.randint(100000, 999999))

            # Save OTP temporarily (can be in the session, or you can use Django cache, etc.)
            request.session['otp'] = otp
            request.session['otp_email'] = email  # Storing email to match OTP

            # Send OTP via email
            send_mail(
                subject="Reset Your Password - OTP Inside",
                message=(
                    f"Hello,\n\n"
                    f"We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed:\n\n"
                    f"🔒 Your OTP: {otp}\n\n"
                    f"If you did not request a password reset, please ignore this email or contact our support team.\n\n"
                    f"Best regards,\n"
                    f"ArticleHub Team"
                ),
                from_email="support@articlehub.com",
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"detail": "OTP sent to your email."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# OTP Verification for Password Reset
class OTPVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Verify OTP for password reset",
        request_body=OTPVerificationSerializer,
        responses={200: openapi.Response("OTP verified successfully."), 400: openapi.Response("Invalid OTP or expired.")},
    )
    def post(self, request, *args, **kwargs):
        serializer = OTPVerificationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            return Response({'message': 'OTP verified successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Password Reset with OTP
class PasswordResetWithOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Reset password with OTP",
        request_body=PasswordResetWithOTPSerializer,
        responses={200: openapi.Response("Password reset successful."), 400: openapi.Response("Invalid OTP or other errors.")},
    )
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetWithOTPSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Process the password reset after OTP validation
            user = serializer.save()
            email = user.email

            # Invalidate OTP by removing it from the session
            if 'otp' in request.session:
                del request.session['otp']
            if 'otp_email' in request.session:
                del request.session['otp_email']

            # Notify user about password change
            send_mail(
                subject="Your Password Has Been Successfully Updated",
                message=(
                    f"Hello,\n\n"
                    f"We wanted to let you know that your password has been successfully updated. "
                    f"If you made this change, no further action is required.\n\n"
                    f"If you did not request this change, please contact our support team immediately to secure your account.\n\n"
                    f"Best regards,\n"
                    f"ArticleHub Team"
                ),
                from_email="support@articlehub.com",
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Validate Token View (check user info)
class ValidateTokenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })