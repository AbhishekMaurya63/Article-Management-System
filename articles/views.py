from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated,IsAdminUser

def index(request):
    return render(request,'publicview/index.html')

def public_article(request, id):
    return render(request,'publicview/article.html',{"id":id})

def Dashboard(request):
    permission_classes = [IsAuthenticated]
    return render(request,'Dashboard/dashboard.html')

def Articles(request):
    permission_classes = [IsAuthenticated]
    return render(request,'Dashboard/articels.html')
def Add_articles(request):
    permission_classes=[IsAuthenticated]
    return render(request,'articles/add_articles.html')
def artical_view(request,id):
    permission_classes=[IsAuthenticated]
    return render(request,'articles/article_view.html',{'id':id})

def update_article(request,id):
    permission_classes=[IsAuthenticated]
    return render(request,'articles/update_article.html',{'id':id})

def Users(request):
    permission_classes=[IsAuthenticated]
    return render(request,'Dashboard/users.html')

def Add_users(request):
    permission_classes=[IsAuthenticated]
    return render(request,'users/add_user.html')

def user_details(request,id):
    permission_classes=[IsAuthenticated]
    return render(request,'users/user_details.html',{'id':id})


def user_updates(request,id):
    permission_classes=[IsAuthenticated]
    return render(request,'users/update_user.html',{'id':id})

def profile(request):
    permission_classes=[IsAuthenticated]
    return render(request,'articles/profile.html')

def update_profile(request):
    permission_classes=[IsAuthenticated]
    return render(request,'articles/profile_update.html')

def change_password(request,id):
    pemission_classes=[IsAuthenticated]
    return render(request,'articles/change_password.html',{"id":id})

def termcond(request):
    return render(request,'publicview/termcond.html')

# Create your views here.
