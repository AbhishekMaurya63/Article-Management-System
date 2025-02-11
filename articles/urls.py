from django.urls import path,include
from . import views
from django.conf import settings
from django.conf.urls.static import static
app_name = 'articles'
urlpatterns=[
    path("dashboard/", views.Dashboard,name="Dashboard"),
    path('articles/',views.Articles, name="Articles"),
    path('articles/<int:id>/',views.artical_view, name="artical_view"),
    path('add_articles/',views.Add_articles, name="Add_Articles"),
    path('update_article/<int:id>/',views.update_article, name='Update_article'),
    path('users/',views.Users, name='Users'),
    path('add_users/',views.Add_users, name='Add_users'),
    path('user_details/<int:id>/',views.user_details, name="User_details"),
    path('user_updates/<int:id>/', views.user_updates, name='User_update'),
    path('profile/', views.profile, name='Profile'),
    path('profile/update/',views.update_profile, name='Update_profile'),
    path('change_password/<int:id>/',views.change_password, name='Change_password'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)