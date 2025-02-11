from django.urls import path
from .views import (
    ArticleViewerRegistrationView,
    ArticleViewerLoginView,
    ArticleViewerListView,
    ArticleViewerDetailView,
    ArticleViewerUpdateView,
    ArticleViewerDeleteView,
    ChangePasswordView,
    PasswordResetRequestView,
    UserDeleteView,
    LogoutView,
    RequestOTPView,
    OTPVerificationView,
    PasswordResetWithOTPView,
    ValidateTokenView
)

urlpatterns = [
    path('register/', ArticleViewerRegistrationView.as_view(), name='register-view'),
    path('login/', ArticleViewerLoginView.as_view(), name='login-view'),
    path('viewers/', ArticleViewerListView.as_view(), name='viewer-list'),
    path('viewers/<int:pk>/', ArticleViewerDetailView.as_view(), name='viewer-detail'),
    path('viewers/update/', ArticleViewerUpdateView.as_view(), name='viewer-update'),
    path('viewers/delete/<int:pk>/', ArticleViewerDeleteView.as_view(), name='viewer-delete'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('user-delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('verify-otp/', OTPVerificationView.as_view(), name='verify-otp'),
    path('password-reset-with-otp/', PasswordResetWithOTPView.as_view(), name='password-reset-with-otp'),
    path('validate-token/', ValidateTokenView.as_view(), name='validate-token'),
]
