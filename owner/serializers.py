from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.serializers import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError as dv
from owner.models import Owner
from django.contrib.auth import authenticate


class OwnerSerializer(serializers.ModelSerializer):
    """This is the serializer class for the Owner model"""
    class Meta:
        model = Owner
        exclude = ['password', 'groups', 'user_permissions']

        def update(self, instance, validated_data):
            return super().partial_update(instance, validated_data)


class CreateOwnerSerializer(serializers.ModelSerializer):
    """This is the serializer class for creating an Owner"""
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Owner
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'zip_code',
            'country',
            'company_name',
            'password'
        ]

    def validate_company_name(self, value):
        """Check if the company_name is already registered."""
        if Owner.objects.filter(company_name=value).exists():
            raise dv("The company name is already registered.")
        return value

    def create(self, validated_data):
        """Create a new owner with hashed password"""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update an owner, hash the new password if it's being updated.
        """
        # Check if the password is being updated
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])

        # Update the owner
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class TokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    model = None  # This should be overridden by subclasses

    def validate(self, attrs):
        user = authenticate(
            request=self.context['request'],
            email=attrs['email'],
            password=attrs['password']
            )
        if not user:
            try:
                # Try to get the user by email
                self.model.objects.get(email=attrs['email'])
                raise ValidationError({'password': ['Incorrect password.']})  
            except self.model.DoesNotExist:
                # If user doesn't exist, it's a wrong email
                raise ValidationError({'email': ['No active account found with this email.']})
        # if not user:
        #     msg = {'detail': 'No active account found with the given credentials'}
        #     raise serializers.ValidationError(msg)
        
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user,
        }

class OwnerTokenObtainPairSerializer(TokenObtainPairSerializer):
    model = Owner