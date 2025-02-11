from django.db import models
from django.contrib.auth.hashers import make_password

class ArticleViewer(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)  # Store hashed passwords
    name = models.CharField(max_length=255, null=True, blank=True)  # Optional full name
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)  # Optional profile image
    contact = models.CharField(max_length=15, null=True, blank=True)  # Optional contact number
    address = models.TextField(null=True, blank=True)  # Optional address
    dob = models.DateField(null=True, blank=True)  # Optional date of birth
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # If it's a new instance, hash the password
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
