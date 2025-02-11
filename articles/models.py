# articles/models.py
from django.db import models
from django.core.validators import MinLengthValidator, EmailValidator
from django.utils.timezone import now
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, MinLengthValidator
from django.db import models
from django.utils.timezone import now
from django.core.validators import FileExtensionValidator

from django.db import models
from django.conf import settings

class Country(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True, blank=True, null=True)  # Optional ISO country code

    def __str__(self):
        return self.name


class State(models.Model):
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name="states")

    # class Meta:
    #     unique_together = ('name', 'country')  # Ensure unique state names per country

    def __str__(self):
        return f"{self.name}, {self.country.name}"


class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name="cities")

    # class Meta:
    #     unique_together = ('name', 'state')  # Ensure unique city names per state

    def __str__(self):
        return f"{self.name}, {self.state.name}, {self.state.country.name}"


class Article(models.Model):
    # Choices for article status
    STATUS_CHOICES = [
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Reject'),
        ('published', 'Published')
    ]
    
    # Article fields
    title = models.CharField(max_length=200, validators=[MinLengthValidator(10)])
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    content = models.TextField()
    author_name = models.CharField(max_length=255, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    email = models.EmailField(validators=[EmailValidator()], null=True)
    
    # Image field with size and type validation
    image = models.ImageField(
        upload_to='articles/images/', 
        null=True, 
        blank=True, 
        validators=[FileExtensionValidator(allowed_extensions=['jpg','jpeg','png','gif','bmp','tiff','webp','heic','heif','ico','psd','webp','avif'])]
    )

    # Comma-separated tags
    tags = models.CharField(max_length=255, null=True, blank=True)  # Store as a string, can be split into list when needed
    
    category = models.CharField(
        max_length=100, 
        choices= [
            ('news', 'News'),
            ('opinion', 'Opinion'),
            ('feature', 'Feature'),
            ('technology', 'Technology'),
            ('health', 'Health'),
            ('business', 'Business'),
            ('entertainment', 'Entertainment'),
            ('politics', 'Politics'),
            ('sports', 'Sports'),
            ('lifestyle', 'Lifestyle'),
            ('education', 'Education'),
            ('environment', 'Environment'),
            ('culture', 'Culture'),
        ]
    )
    
    publish_date = models.DateField(null=True, blank=True)
    agreed_to_terms = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='review')

    # Location fields
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True, related_name="articles")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    def clean(self):
        # Custom validation for publish_date
        if self.publish_date and self.publish_date <= now().date():
            raise ValidationError('Publish date must be in the future.')

        # Validation for terms agreement
        if not self.agreed_to_terms:
            raise ValidationError('You must agree to the terms.')

        # Optional: additional validation to ensure the image is under a certain size
        if self.image:
            file_size = self.image.size  # In bytes
            if file_size > 5 * 1024 * 1024:  # 5 MB size limit
                raise ValidationError("Image file size must be less than 5MB.")
            elif file_size < 100 * 1024:  # 100 KB size limit
                raise ValidationError("Image file size must be at least 100KB.")

    def __str__(self):
        return self.title



class ArticleImage(models.Model):
    article = models.ForeignKey(
        Article,  # Replace with your actual Article model name if different
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(
    upload_to='article_images/',
    validators=[FileExtensionValidator(allowed_extensions=['jpg','jpeg','png','gif','bmp','tiff','webp','heic','heif','ico','psd','avif'])],
    null=True
)
    caption = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for Article: {self.article.title}"