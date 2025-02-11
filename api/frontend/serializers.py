from rest_framework import serializers
from frontend.models import ArticleViewer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
class ArticleViewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleViewer
        fields = ['id', 'email', 'username', 'name', 'profile_image', 'contact', 'address', 'dob', 'date_joined', 'is_active']
        read_only_fields = ['date_joined', 'is_active']  # Make 'date_joined' and 'is_active' read-only

    def validate_email(self, value):
        """Ensure email is unique."""
        if ArticleViewer.objects.filter(email=value).exists():
            raise ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        """Ensure username is unique."""
        if ArticleViewer.objects.filter(username=value).exists():
            raise ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        """Override create method to handle password hashing."""
        password = validated_data.pop('password')
        viewer = ArticleViewer(**validated_data)
        viewer.set_password(password)
        viewer.save()
        return viewer

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            print(user)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User is deactivated.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        return data
    
    
class ArticleViewerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleViewer
        fields = ['name', 'profile_image', 'contact', 'address', 'dob']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        """Check if email exists."""
        if not ArticleViewer.objects.filter(email=value).exists():
            raise ValidationError("No user found with this email address.")
        return value

class OTPPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        """Ensure user exists with the given email."""
        if not ArticleViewer.objects.filter(email=value).exists():
            raise ValidationError("No user found with this email address.")
        return value

class PasswordResetWithOTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField()

    def validate_otp(self, value):
        """Ensure OTP matches stored value."""
        otp = value
        stored_otp = self.context['request'].session.get('otp')
        if otp != stored_otp:
            raise ValidationError("Invalid OTP.")
        return value

    def save(self):
        """Reset the password after OTP validation."""
        email = self.context['request'].session.get('otp_email')
        user = ArticleViewer.objects.get(email=email)
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class OTPVerificationSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)

    def validate_otp(self, value):
        """Ensure OTP matches stored value."""
        otp = value
        stored_otp = self.context['request'].session.get('otp')
        if otp != stored_otp:
            raise ValidationError("Invalid OTP.")
        return value
