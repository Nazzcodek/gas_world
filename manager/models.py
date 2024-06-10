from django.db import models
from owner.models import User


class Manager(User):
    """
    this class create a manager instant for the station
    """
    station = models.OneToOneField(
        'station.Station',
        on_delete=models.CASCADE,
        related_name='manager_station'
    )
    is_manager = models.BooleanField(default=True)

    REQUIRED_FIELDS = ['station']
