from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from uuid import uuid4
from owner.manager import CustomUserManager


class BaseModel(models.Model):
    """
    Base model representing common fields and attributes for other models.
    """

    id = models.UUIDField(
        default=uuid4, editable=False, unique=True, primary_key=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=50)
    email = models.EmailField(
        max_length=50, blank=False, null=False, unique=True
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(null=True)
    city = models.CharField(max_length=50, null=True)
    state = models.CharField(max_length=50, null=True)
    zip_code = models.CharField(max_length=10, null=True)
    country = models.CharField(max_length=50, null=True)

    class Meta:
        abstract = True


class CustomUserBase(AbstractBaseUser, PermissionsMixin, BaseModel):
    """
    A custom base user model that extends AbstractBaseUser,
    PermissionsMixin, and BaseModel.

    Attributes:
        password (str): The user's password.
        objects (CustomUserManager): The manager for this model.
        USERNAME_FIELD (str):
            The field used as the unique
            identifier for the user (usually 'email').
        REQUIRED_FIELDS (list):
            The list of fields required when creating a user.
    """

    password = models.CharField(max_length=128)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'password']

    def __str__(self):
        return self.email

    class Meta:
        abstract = True


class User(CustomUserBase):
    """
    Represents a user in the system.

    Inherits from CustomUserBase and
    provides additional functionality specific to users.

    Attributes:
        Meta: A nested class that contains
            metadata options for the User model.

    """
    class Meta(CustomUserBase.Meta):
        abstract = False
        swappable = 'AUTH_USER_MODEL'


class Owner(User):
    """
    Represents an owner in the gas world application.

    Inherits from the User model and
    adds additional fields specific to owners.

    Attributes:
        company_name (str): The name of the owner's company.
        is_owner (bool):
            Indicates whether the user is an owner or not.

    """

    company_name = models.CharField(max_length=50, null=False, unique=True)
    is_owner = models.BooleanField(default=True)

    REQUIRED_FIELDS = ['company_name']
