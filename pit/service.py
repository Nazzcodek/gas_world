from django.db import models
from uuid import uuid4


class BaseModel(models.Model):
    id = models.UUIDField(
        default=uuid4,
        editable=False,
        unique=True,
        primary_key=True
        )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
