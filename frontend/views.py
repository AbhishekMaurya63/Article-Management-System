from django.shortcuts import render, get_object_or_404
from articles.models import Article  # Assuming you have an Article model
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import HttpResponse
# View for the Article List (Home Page)
def article_list(request):
    articles = Article.objects.filter(status='published')  # Assuming 'status' is used to filter published articles
    return render(request, 'article_list.html', {'articles': articles})

# View for the Article Detail Page
def article_detail(request, id):
    article = get_object_or_404(Article, id=id)
    
    # Optional: Fetch related articles (e.g., by the same author or category)
    related_articles = Article.objects.filter(author=article.author).exclude(id=id)[:5]
    
    return render(request, 'article_detail.html', {
        'article': article,
        'related_articles': related_articles,
    })

# View for Search Results (Optional)
def search_results(request):
    query = request.GET.get('q', '')
    articles = Article.objects.filter(title__icontains=query, status='published')  # Filter by title or other fields
    return render(request, 'search_results.html', {'articles': articles, 'query': query})

# View for the About Page (Optional)
def about(request):
    return render(request, 'about.html')

# View for the Contact Page (Optional)
def contact(request):
    return render(request, 'contact.html')

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        # Check if passwords match
        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return redirect('register')

        # Create new user
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()
            messages.success(request, "Account created successfully!")
            return redirect('login')
        except Exception as e:
            messages.error(request, str(e))
            return redirect('register')

    return render(request, 'register.html')

# User Login View
def login_view(request):
    if request.method == 'POST':
        username_email = request.POST['username_email']
        password = request.POST['password']

        # Authenticate user
        user = authenticate(request, username=username_email, password=password) or authenticate(request, email=username_email, password=password)

        if user is not None:
            login(request, user)
            return redirect('article_list')  # Redirect to article list after login
        else:
            messages.error(request, "Invalid username/email or password")
            return redirect('login')

    return render(request, 'login.html')
