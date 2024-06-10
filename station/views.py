from rest_framework import viewsets
from rest_framework.response import Response
from station.models import Station
from station.serializers import StationSerializer, StationCreateSerializer
from owner.permissions import IsAuthenticatedOwner, IsStationOwner
from owner.models import Owner
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist


class StationViewSet(viewsets.ModelViewSet):
    """This is the station view set"""
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticatedOwner, IsStationOwner]

    def get_queryset(self):
        """
        Returns the queryset of stations owned by the authenticated owner.

        If the user is not authenticated, an empty queryset is returned.
        If the user is authenticated but does not have an
        associated Owner object, an empty queryset is returned.
        Otherwise, the queryset contains only the stations owned
        by the authenticated owner.

        Returns:
            QuerySet:
            The queryset of stations owned by the authenticated owner.
        """
        user = self.request.user
        if not user.is_authenticated:
            return Station.objects.none()

        try:
            owner = Owner.objects.get(pk=user.pk)
        except Owner.DoesNotExist:
            return Station.objects.none()

        # Return only the stations owned by the authenticated owner
        return Station.objects.filter(owner=owner)

    def get_serializer_class(self):
        """
        Use StationCreateSerializer for the
        'create' action and StationSerializer for others.
        """
        if self.action == 'create':
            return StationCreateSerializer
        return StationSerializer

    def perform_create(self, serializer):
        """
        Set the owner of the station to the
        currently authenticated Owner instance during creation.
        """
        try:
            owner = Owner.objects.get(pk=self.request.user.pk)
            serializer.save(owner=owner)
        except ObjectDoesNotExist:
            raise serializers.ValidationError(
                "The authenticated user is not an owner."
            )

    def perform_update(self, serializer):
        """
        Ensure the owner field is not required during updates.
        """
        serializer.save()

    def update(self, request, *args, **kwargs):
        """
        Override the update method to ensure the owner field is not required.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
            )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
