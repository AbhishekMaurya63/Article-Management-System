from django.contrib.auth.models import AbstractUser
from django.db import models

# Custom User Model
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # Ensure email is unique
    ROLE_CHOICES = [
        ('Journalist', 'Journalist'),
        ('Editor', 'Editor'),
        ('Admin', 'Admin'),
    ]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Journalist')  # Default role is Journalist
    checkbox=models.BooleanField(default=False,null=True)
    
    def __str__(self):
        return self.username

# Profile Model
class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    contact_info = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
