# # # api/urls.py
# # from django.urls import path, 
# from rest_framework.routers import DefaultRouter
# from api.views.article_views import ArticleViewSet,ArticleImageViewSet, CountryViewSet, StateViewSet, CityViewSet
# from django.conf import settings
# from django.conf.urls.static import static


# app_name = 'api'

# from django.urls import path, include
# from .views.user_views import (
#     UserRegistrationView, UserLoginView, 
#     UserListView, UserDetailView, 
#     UserUpdateView, ChangePasswordView, 
#     PasswordResetRequestView, UserDeleteView,LogoutView,RequestOTPView,PasswordResetWithOTPView,ValidateTokenView,UsersUpdateView,OTPVerificationView
# )
# from .views.article_views import PublishedArticleView,PublishedArticleDetailView
# router = DefaultRouter()
# router.register(r'articles', ArticleViewSet)
# router.register(r'article-images', ArticleImageViewSet, basename='article-image')
# router.register('countries', CountryViewSet)
# router.register('states', StateViewSet)
# router.register('cities', CityViewSet)
# urlpatterns = [
#     # User Registration
#     path('', include(router.urls)),
#     path('register/', UserRegistrationView.as_view(), name='user-register'),
    
#     # User Login
#     path('login/', UserLoginView.as_view(), name='user-login'),
    
#     path("validate-token/", ValidateTokenView.as_view(), name="validate-token"),
#     # User List (Admin Only)
#     path('list/', UserListView.as_view(), name='user-list'),
    
#     # User Detail (Authenticated User)
#     path('detail/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
#     # Update User (Authenticated User)
#     path('update/', UserUpdateView.as_view(), name='user-update'),
    
#     path('update/<int:id>/', UsersUpdateView.as_view(), name='users-update'),
    
#     # Change Password (Authenticated User)
#     path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
#     # Password Reset Request
#     path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    
#     # Delete User (Admin Only)
#     path('delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),

#     path('logout/', LogoutView.as_view(), name='logout'),

#     path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
#     path('reset-password-with-otp/', PasswordResetWithOTPView.as_view(), name='reset_password_with_otp'),
#      path('verify-otp/', OTPVerificationView.as_view(), name='verify-otp'),
#     path('published-articles/',PublishedArticleView.as_view(),name='publish_data'),
#     path('published-articles/<int:id>/', PublishedArticleDetailView.as_view(), name='article_detail'),
#     *router.urls,
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



# api/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views.article_views import ArticleViewSet, ArticleImageViewSet, CountryViewSet, StateViewSet, CityViewSet
from .views.user_views import (
    UserRegistrationView, UserLoginView, UserListView, UserDetailView, 
    UserUpdateView, ChangePasswordView, PasswordResetRequestView, UserDeleteView, 
    LogoutView, RequestOTPView, PasswordResetWithOTPView, ValidateTokenView, 
    UsersUpdateView, OTPVerificationView
)
from .views.article_views import PublishedArticleView, PublishedArticleDetailView
from django.conf import settings
from django.conf.urls.static import static

# Set up the router
router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'article-images', ArticleImageViewSet, basename='article-image')
router.register('countries', CountryViewSet)
router.register('states', StateViewSet)
router.register('cities', CityViewSet)

app_name = 'api'  # Namespace for reverse URL lookups

urlpatterns = [
    # User Registration
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    
    # User Login
    path('login/', UserLoginView.as_view(), name='user-login'),
    
    path("validate-token/", ValidateTokenView.as_view(), name="validate-token"),
    
    # User List (Admin Only)
    path('list/', UserListView.as_view(), name='user-list'),
    
    # User Detail (Authenticated User)
    path('detail/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Update User (Authenticated User)
    path('update/', UserUpdateView.as_view(), name='user-update'),
    path('update/<int:id>/', UsersUpdateView.as_view(), name='users-update'),
    
    # Change Password (Authenticated User)
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Password Reset Request
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    
    # Delete User (Admin Only)
    path('delete/<int:pk>/', UserDeleteView.as_view(), name='user-delete'),

    path('logout/', LogoutView.as_view(), name='logout'),

    path('request-otp/', RequestOTPView.as_view(), name='request_otp'),
    path('reset-password-with-otp/', PasswordResetWithOTPView.as_view(), name='reset_password_with_otp'),
    path('verify-otp/', OTPVerificationView.as_view(), name='verify-otp'),

    # Published Articles Endpoints
    path('published-articles/', PublishedArticleView.as_view(), name='publish_data'),
    path('published-articles/<int:id>/', PublishedArticleDetailView.as_view(), name='article_detail'),
    
    # Include the router URLs
    *router.urls,
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
