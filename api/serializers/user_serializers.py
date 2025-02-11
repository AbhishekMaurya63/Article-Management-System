from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from users.models import Profile  # Adjust based on your Profile model location
import re
import json
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
User = get_user_model()


# Profile Serializer
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'profile_picture', 'contact_info']

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id','first_name','last_name', 'username', 'email', 'role', 'is_active', 'date_joined','profile']

class RegistrationSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)  # Allow profile data to be optional

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 'role', 'checkbox', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Extract profile data if provided
        res = validateall(validated_data)
        if not res["result"]:  # If validation fails, raise an error
            errodic = {key: value for key, value in res.items() if value not in ('', False)}
            raise serializers.ValidationError(errodic)

        profile_data = validated_data.pop('profile', None)

        # Set default values for first_name and last_name
        first_name = validated_data.get('first_name', 'N/A')
        last_name = validated_data.get('last_name', 'N/A')

        # Set default role if not provided
        role = validated_data.get('role', 'Journalist')

        # Determine is_staff and is_superuser based on role
        if role == 'Admin':
            is_staff = True
            is_superuser = True
        elif role == 'Editor':
            is_staff = True
            is_superuser = False
        else:
            is_staff = True
            is_superuser = False

        # Create the user (password is hashed automatically)
        user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            checkbox=True,
            role=role,
            is_staff=is_staff,
            is_superuser=is_superuser
        )

        # Optionally handle profile data here if applicable
        if profile_data:
            Profile.objects.create(user=user, **profile_data)

        return user



# Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        username = data.get('username')
        password = data.get('password')
        if not username:
            raise serializers.ValidationError("Enter username to log in.")

        user = authenticate(username=username, password=password)
        if not user:
            user = authenticate(email=username, password=password)
            if not user:
             raise serializers.ValidationError("Invalid credentials.")
        
        data['user'] = user
        return data

# User Update Serializer
class UserUpdateSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'role', 'profile']
        extra_kwargs = {
            'email': {'required': False},
            'username': {'required': False},
            'role': {'required': False},  # Optional if you want admin to update roles
        }

    def update(self, instance, validated_data):
        # Extract the profile data
        profile_data = validated_data.pop('profile', {})

        # Handle role updates
        if 'role' in validated_data:
            new_role = validated_data['role']
            # Check if the user making the request is an admin
            request_user = self.context['request'].user
            if not request_user.is_superuser:  # Or check `request_user.role == 'Admin'`
                raise serializers.ValidationError({
                    'role': "You do not have permission to change the role."
                })

            instance.role = new_role  # If role is updated, save it
            
            # Automatically set is_staff and is_superuser for admins
            if instance.role == 'Admin':
                instance.is_staff = True
                instance.is_superuser = True
            elif instance.role == 'Editor':
                instance.is_staff = True
                instance.is_superuser = False
            else:
                # Reset is_staff and is_superuser for non-admin roles
                instance.is_staff = False
                instance.is_superuser = False

        # Update the User model fields
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        
        # Save the updated user instance
        instance.save()

        # Update the Profile model associated with the User
        profile = instance.profile  # Get the associated profile
        profile.bio = profile_data.get('bio', profile.bio)
        profile.profile_picture = profile_data.get('profile_picture', profile.profile_picture)
        profile.contact_info = profile_data.get('contact_info', profile.contact_info)

        # Save the profile after updating it
        profile.save()

        return instance

# Change Password Serializer
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        # if not user.check_password(value):
        #     raise serializers.ValidationError("Old password is incorrect.")

        return value

# Password Reset Serializer
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        form = PasswordResetForm(data={'email': value})
        if not form.is_valid():
            raise serializers.ValidationError("Invalid email address.")
        return value

    def save(self, request):
        form = PasswordResetForm(data=self.initial_data)
        if form.is_valid():
            form.save(
                request=request,
                use_https=request.is_secure(),
                email_template_name='registration/password_reset_email.html'
            )

from django.core.exceptions import ObjectDoesNotExist
import random

class OTPPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except ObjectDoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        return value

class OTPVerificationSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)

    def validate_otp(self, value):
        # Retrieve OTP from session
        otp = self.context.get('request').session.get('otp')

        # Ensure OTP exists in the session
        if not otp:
            raise serializers.ValidationError("OTP has expired or was not requested.")

        # Validate OTP
        if otp != value:
            raise serializers.ValidationError("Invalid OTP.")

        return value
    
    
class PasswordResetWithOTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_otp(self, value):
        # Access the request object from the context
        otp = self.context.get('request').session.get('otp')

        # Ensure OTP exists in the session
        if not otp:
            raise serializers.ValidationError("OTP has expired or was not requested.")

        # Compare the OTP stored in session with the one provided by the user
        if otp != value:
            raise serializers.ValidationError("Invalid OTP.")
        
        # If OTP is valid, return the value
        return value

    def create(self, validated_data):
        # Retrieve the user based on the email stored in session
        email = self.context.get('request').session.get('otp_email')
        user = User.objects.get(email=email)
        old_password=user.password
        new_password=validated_data['new_password']
        if check_password(new_password, old_password):
         raise serializers.ValidationError(
            {"new_password": "The new password must be different from the old password."}
        )
        # Set the new password
        user.set_password(validated_data['new_password'])
        user.save()

        # Return the user after resetting password
        return user



class validater:
    def fnamevalidater(name):
        # validater=r'^[a-zA-Z]+[\sa-zA-Z]+[a-zA-Z]$'
        validater=r'^[a-zA-Z](?!.*[._]{2})[a-zA-Z0-9._]{1,14}[a-zA-Z0-9]$'
        if(re.match(validater,name.rstrip())):
            return True
        else:
            return False  
    def lnamevalidater(name):
        validater=r'^[a-zA-Z]+$'
        if(re.match(validater,name.rstrip())):
            return True
        else:
            return False 
    def usernamevalidater(uname):
        pattern = r'^[a-zA-Z](?!.*[._]{2})[a-zA-Z0-9._]{1,14}[a-zA-Z0-9]$'
        if re.fullmatch(pattern, uname):
         return True
        else:
         return False
    def emailvalidater(email):
            
        # Regex pattern matching the given criteria
        regex = r'^[a-zA-Z]+([a-zA-Z0-9.-_]+)?@[a-zA-Z]+\.(?P<firstDomain>[a-zA-Z]{2,5})(?:\.(?P<secondDomain>[a-zA-Z]{2,5}))?$'
        
        # Trim whitespace and match with the regex pattern
        matches = re.match(regex, email.strip())
          
        if not matches:
            return False  # Invalid email format
        
        # Extract firstDomain and secondDomain
        first_domain = matches.group('firstDomain')
        second_domain = matches.group('secondDomain')
        
        # Check if second domain exists and if both domains are identical
        if second_domain and first_domain.lower() == second_domain.lower():
            return False  # Invalid: first and second domains must not be the same
        return True  # Valid em
    def passwordvalidater(password):
        # Regex pattern to validate the password
        pattern = r'^(?=.*[A-Z])(?=.*[A-Za-z])(?=.*\d)(?=.{8,})'
        
        # Check if the password matches the pattern
        if re.match(pattern, password):
            return True  # Valid password
        else:
            return False  # Invalid password
def validateall(data):
    isvalid=True
    isvalidfname,isvalidlname,isvaliduname,isvalidemail,isvalidpassword,isvalidCopassword,isvalidcheck='','','','','','',''
    if(not validater.usernamevalidater(data['username'])):
        isvaliduname='Invalid Username'
        isvalid=False
    elif(not validater.emailvalidater(data["email"])):
        isvalidemail='Invalid Email'
        isvalid=False
    elif(not validater.passwordvalidater(data["password"])):
        isvalidpassword='This password is not acceptable'
        isvalid=False
    if(isvalid):
        return {"result":True}
    return{"result":False,'status': 'error','isvalidfname':isvalidfname,'isvalidlname':isvalidlname,'isvaliduname':isvaliduname,'isvalidemail':isvalidemail,'isvalidpassword':isvalidpassword}
    
    
        
        
        