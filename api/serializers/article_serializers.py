from rest_framework import serializers
from articles.models import Article , ArticleImage,Country, State, City
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

User = get_user_model()
class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'code']


class StateSerializer(serializers.ModelSerializer):
    country = CountrySerializer()

    class Meta:
        model = State
        fields = ['id', 'name', 'country']

    def create(self, validated_data):
        country_data = validated_data.pop('country')
        country, created = Country.objects.get_or_create(**country_data)
        state = State.objects.create(country=country, **validated_data)
        return state


class CitySerializer(serializers.ModelSerializer):
    state = StateSerializer()

    class Meta:
        model = City
        fields = ['id', 'name', 'state']

    def create(self, validated_data):
        state_data = validated_data.pop('state')
        state, created = State.objects.get_or_create(**state_data)
        city = City.objects.create(state=state, **validated_data)
        return city

class ArticleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleImage
        fields = ['id', 'article', 'image', 'caption', 'uploaded_at']


class ArticleSerializer(serializers.ModelSerializer):
    author = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())  # Author as a foreign key
    tags = serializers.CharField()

    # Location fields directly added as individual fields
    country = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(max_digits=50, decimal_places=20, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=50, decimal_places=20, required=False, allow_null=True)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'subtitle', 'content', 'author_name', 'author', 'email', 'image', 
            'tags', 'category', 'publish_date', 'status', 'agreed_to_terms', 
            'country', 'state', 'city', 'latitude', 'longitude'
        ]
        read_only_fields = ['agreed_to_terms']

    def validate_publish_date(self, value):
        """ Ensure the publish_date is in the future """
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Publish date must be in the future.")
        return value

    def validate_image(self, value):
        """ Ensure image file format and size are valid """
        if value:
            allowed_extensions = ['.jpg','.jpeg','.png','.gif','.bmp','.tiff','.webp','.heic','.heif','.ico','.psd','.webp','.avif']
            file_extension = value.name.split('.')[-1].lower()
            if f'.{file_extension}' not in allowed_extensions:
                raise serializers.ValidationError("This image formats are not allowed.")
            if value.size < 102400 or value.size > 5242880:
                raise serializers.ValidationError("Image size must be between 100KB and 5MB.")
        return value

    def validate_tags(self, value):
        """ Validate tags input """
        tags = value.strip()
        if not tags:
            raise serializers.ValidationError("At least one tag is required.")
        return tags

    def create(self, validated_data):
        """ Create the article instance, handling location fields """
        # Extract location data
        country_name = validated_data.pop('country', None)
        state_name = validated_data.pop('state', None)
        city_name = validated_data.pop('city', None)
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        # Process location data
        city = None
        if country_name and state_name and city_name:
            country, _ = Country.objects.get_or_create(name=country_name)
            state, _ = State.objects.get_or_create(name=state_name, country=country)
            city, _ = City.objects.get_or_create(name=city_name, state=state)

        # Create the article
        article = Article.objects.create(
            **validated_data,
            latitude=latitude,
            longitude=longitude,
            city=city
        )

        # Handle tags
        tags_string = validated_data.pop('tags', "")
        tags_list = [tag.strip() for tag in tags_string.split(',')]
        article.tags = ','.join(tags_list)
        article.save()

        return article

    def update(self, instance, validated_data):
        """ Update the article instance, handling location fields """
        validated_data.pop('author', None)  # Don't allow changing the author
        tags_string = validated_data.pop('tags', None)

        # Update location fields
        country_name = validated_data.pop('country', None)
        state_name = validated_data.pop('state', None)
        city_name = validated_data.pop('city', None)
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        if country_name and state_name and city_name:
            country, _ = Country.objects.get_or_create(name=country_name)
            state, _ = State.objects.get_or_create(name=state_name, country=country)
            city, _ = City.objects.get_or_create(name=city_name, state=state)
            instance.city = city

        instance.latitude = latitude
        instance.longitude = longitude

        # Update tags if provided
        if tags_string:
            tags_list = [tag.strip() for tag in tags_string.split(',')]
            instance.tags = ','.join(tags_list)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


