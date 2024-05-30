from rest_framework import viewsets
from station.models import Station
from station.serializers import StationSerializer, StationCreateSerializer
from owner.permissions import IsAuthenticatedOwner, IsStationOwner
from owner.models import Owner
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()  
    serializer_class = StationSerializer 
    permission_classes = [IsAuthenticatedOwner, IsStationOwner]

    def get_serializer_class(self):
        """
        Use StationCreateSerializer for the 'create' action and StationSerializer for others.
        """
        if self.action == 'create':
            return StationCreateSerializer
        return StationSerializer
    
    def perform_create(self, serializer):
        """
        Set the owner of the station to the currently authenticated Owner instance during creation.
        """
        try:
            owner = Owner.objects.get(pk=self.request.user.pk)  # Get the Owner instance
            serializer.save(owner=owner)  # Assign the Owner instance
        except ObjectDoesNotExist:
            raise serializers.ValidationError("The authenticated user is not an owner.")