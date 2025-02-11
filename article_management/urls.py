from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from articles.views import index, public_article,termcond
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Article Management API",
        default_version='v1',
        description="API documentation for the Article Management System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="support@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    authentication_classes=[]
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    # path('api/token/', views.obtain_auth_token, name='api_token_auth'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/', include('api.urls')),  # Include the API URLs
    path('api/viewers/', include('api.frontend.urls')),  # Include
    path('articles/', include('articles.urls')),
    path('users/', include('users.urls')),  
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('index/',index,name="index"),
    path('', include('frontend.urls')), 
    path('public_article/<int:id>/',public_article,name='Public_article'),
    path('term&con/',termcond, name='Term&con'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
