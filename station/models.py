from django.db import models
from owner.models import BaseModel, Owner
from manager.models import Manager


class Station(BaseModel):
    """this class create a station instant"""
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)
    manager = models.OneToOneField(Manager, on_delete=models.SET_NULL, default=None, related_name='station_manager', null=True)