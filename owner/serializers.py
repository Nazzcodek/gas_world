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
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class UpdatePasswordSerializer(serializers.Serializer):
    """
    Serializer for updating the password of an instance.

    Attributes:
        password (str): The new password to be set for the instance.

    Methods:
        update(instance, validated_data):
            Updates the password of the instance with the
            provided validated data.
    """
    password = serializers.CharField(write_only=True)

    def update(self, instance, validated_data):
        """
        Updates the password of the instance with
        the provided validated data.

        Args:
            instance: The instance whose password needs to be updated.
            validated_data: The validated data containing the new password.

        Returns:
            The updated instance with the new password.
        """
        instance.password = make_password(validated_data['password'])
        instance.save()
        return instance


class TokenObtainPairSerializer(serializers.Serializer):
    """
    Serializer for obtaining a JSON web token pair.

    This serializer takes in an email and password,
    validates the credentials, and returns a JSON web token
    pair (refresh token and access token) along with the user object.

    Attributes:
        email (str): The email of the user.
        password (str): The password of the user.
        model (None): The model associated with the user.

    Methods:
        validate(attrs): Validates the email and password,
        and returns the JSON web token pair and user object.

    """

    email = serializers.EmailField()
    password = serializers.CharField()
    model = None

    def validate(self, attrs):
        user = authenticate(
            request=self.context['request'],
            email=attrs['email'],
            password=attrs['password']
            )
        if not user:
            try:
                self.model.objects.get(email=attrs['email'])
                raise ValidationError({'password': ['Incorrect password.']})
            except self.model.DoesNotExist:
                raise ValidationError(
                    {'email': ['No active account found with this email.']}
                    )

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user,
        }


class OwnerTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer for obtaining a token pair for an owner.
    """
    model = Owner
