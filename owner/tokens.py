from rest_framework_simplejwt.models import OutstandingToken, BlacklistedToken
from owner.models import Owner
from django.db import models


class CustomOutstandingToken(OutstandingToken):
    """
    Represents a custom outstanding token.

    This class extends the `OutstandingToken` model and
    adds a foreign key relationship with the `Owner` model.
    It also defines some meta options for the model.

    Attributes:
        user (ForeignKey): The foreign key to the `Owner` model.
    """

    user = models.ForeignKey(
        Owner, on_delete=models.CASCADE,
        related_name='outstanding_tokens'
        )

    class Meta:
        abstract = False
        verbose_name = 'outstanding token'
        verbose_name_plural = 'outstanding tokens'
        indexes = [
            models.Index(fields=['user']),
        ]


class CustomBlacklistedToken(BlacklistedToken):
    """
    Represents a blacklisted token associated with a custom outstanding token.

    Inherits from the `BlacklistedToken` model and adds a
    one-to-one relationship with the `CustomOutstandingToken` model.

    Attributes:
        token (OneToOneField):
        A one-to-one relationship with the `CustomOutstandingToken` model.

    Meta:
        abstract (bool): Specifies whether this model is abstract or not.
        verbose_name (str): The human-readable name for this model.
        verbose_name_plural (str):
            The human-readable plural name for this model.
        indexes (list): A list of indexes to be created for this model.
    """
    token = models.OneToOneField(
        CustomOutstandingToken,
        on_delete=models.CASCADE,
        related_name='blacklisted_token')

    class Meta:
        abstract = False
        verbose_name = 'blacklisted token'
        verbose_name_plural = 'blacklisted tokens'
        indexes = [
            models.Index(fields=['token']),
        ]
