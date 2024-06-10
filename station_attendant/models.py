from django.db import models
from owner.models import User
from station.models import Station


class Attendant(User):
    """
    This class creates an attendant instance for the station.
    """
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='attendants'
    )
    is_attendant = models.BooleanField(default=True)

    REQUIRED_FIELDS = ['station']
