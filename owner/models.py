from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group, Permission
from uuid import uuid4
from owner.manager import CustomUserManager

class BaseModel(models.Model):
    id = models.UUIDField(default=uuid4, editable=False, unique=True, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=50)
    email = models.EmailField(max_length=50, blank=False, null=False, unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(null=True)
    city = models.CharField(max_length=50, null=True)
    state = models.CharField(max_length=50, null=True)
    zip_code = models.CharField(max_length=10, null=True)
    country = models.CharField(max_length=50, null=True)

    class Meta:
        abstract = True

class CustomUserBase(AbstractBaseUser, PermissionsMixin, BaseModel):
    password = models.CharField(max_length=128)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'password']

    def __str__(self):
        return self.email

    class Meta:
        abstract = True

class User(CustomUserBase):
    class Meta(CustomUserBase.Meta):
        abstract = False
        swappable = 'AUTH_USER_MODEL'

class Owner(User):
    company_name = models.CharField(max_length=50, null=False, unique=True)
    is_owner = models.BooleanField(default=True)

    REQUIRED_FIELDS = ['company_name']