from rest_framework_simplejwt.models import TokenUser, OutstandingToken, BlacklistedToken
from owner.models import Owner
from django.db import models

class CustomOutstandingToken(OutstandingToken):
    user = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name='outstanding_tokens')

    class Meta:
        abstract = False
        verbose_name = 'outstanding token'
        verbose_name_plural = 'outstanding tokens'
        indexes = [
            models.Index(fields=['user']),
        ]

class CustomBlacklistedToken(BlacklistedToken):
    token = models.OneToOneField(CustomOutstandingToken, on_delete=models.CASCADE, related_name='blacklisted_token')

    class Meta:
        abstract = False
        verbose_name = 'blacklisted token'
        verbose_name_plural = 'blacklisted tokens'
        indexes = [
            models.Index(fields=['token']),
        ]
