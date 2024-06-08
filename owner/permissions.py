from rest_framework import permissions
from django.core.cache import cache
from station.models import Station
from manager.models import Manager
from owner.models import Owner
from station_attendant.models import Attendant
from station_attendant.models import Attendant
from product.models import Product, Pump, PumpReading
from pit.models import Pit, PitReading
from sales.models import Sales

class IsAuthenticatedOwner(permissions.BasePermission):
    """
    Allows access only to authenticated owners (those who can create stations).
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Check if the user is an owner using cached value first
        is_owner_cache_key = f"is_owner_{request.user.id}"
        is_owner = cache.get(is_owner_cache_key)

        if is_owner is None:
            # Cache miss: Fetch from the database and store in cache
            is_owner = request.user.is_owner  # Assuming you have an 'is_owner' field on your Owner model
            cache.set(is_owner_cache_key, is_owner, timeout=3600)  # Cache for 1 hour (adjust as needed)

        return is_owner


class IsStationOwner(permissions.BasePermission):
    """
    Allows access only if the user is the owner of the station associated with the object (Station or Manager).
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        try:
            # Check if the user is an owner.
            owner = Owner.objects.get(pk=request.user.pk)
        except Owner.DoesNotExist:
            return False  # User is not an owner

        # Determine the station associated with the object
        if isinstance(obj, Station):
            station = obj
        elif isinstance(obj, Manager):
            station = obj.station
        elif isinstance(obj, Product):
            station = obj.station
        elif isinstance(obj, Pump):
            station = obj.station
        elif isinstance(obj, Pit):
            station = obj.station
        else:
            return False

        # Check if the user owns the station
        return station.owner == owner


class IsAuthenticatedManager(permissions.BasePermission):
    """Allows access only to authenticated managers of the current station."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Allow general access if user is a manager
        try:
            manager = Manager.objects.get(pk=request.user.pk)
            if manager.station_id:
                return True
        except Manager.DoesNotExist:
            return False

        return False

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        try:
            manager = Manager.objects.get(pk=request.user.pk)
        except Manager.DoesNotExist:
            return False  # User is not a manager

        # Determine the station associated with the object
        station = None
        if isinstance(obj, Product):
            station = obj.station
        elif isinstance(obj, Pump):
            station = obj.station
        elif isinstance(obj, Pit):
            station = obj.station
        elif isinstance(obj, Attendant):
            station = obj.station
        elif isinstance(obj, PumpReading):
            station = obj.pump.station
        elif isinstance(obj, PitReading):
            station = obj.reading_pit.station
        elif isinstance(obj, Sales):
            station = obj.station

        if not station:
            return False

        # Check if manager's station matches the object's station
        manager_station_cache_key = f"manager_station_{manager.id}"
        manager_station_id = cache.get(manager_station_cache_key)

        if manager_station_id is None:
            manager_station_id = manager.station_id
            cache.set(manager_station_cache_key, manager_station_id, timeout=3600)

        return station.id == manager_station_id


class IsAuthenticatedAttendant(permissions.BasePermission):
    """Allows access only to authenticated attendants of the current station."""

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def is_user_attendant(self, user):
        """Check if the user is an attendant and cache the result."""
        is_attendant_cache_key = f"is_attendant_{user.id}"
        is_attendant = cache.get(is_attendant_cache_key)

        if is_attendant is None:
            # Cache miss: Fetch from the database and store in cache
            is_attendant = Attendant.objects.filter(pk=user.pk).exists()
            cache.set(is_attendant_cache_key, is_attendant, timeout=3600)

        return is_attendant

    def get_user_station_id(self, user):
        """Get the user's station ID and cache the result."""
        attendant_station_cache_key = f"attendant_station_{user.id}"
        attendant_station_id = cache.get(attendant_station_cache_key)

        if attendant_station_id is None:
            # Check if the user is an attendant and get the station_id
            try:
                attendant = Attendant.objects.get(pk=user.pk)
                attendant_station_id = attendant.station_id
                cache.set(attendant_station_cache_key, attendant_station_id, timeout=3600)
            except Attendant.DoesNotExist:
                # Handle the case where the user is not an attendant
                return None

        return attendant_station_id

    def has_object_permission(self, request, view, obj):
        if not self.has_permission(request, view):
            return False

        if not self.is_user_attendant(request.user):
            return False

        station = None
        if isinstance(obj, PumpReading):
            station = obj.pump.station
        elif isinstance(obj, Sales):
            station = obj.station
        elif hasattr(obj, 'station'):
            station = obj.station

        if not station:
            return False

        attendant_station_id = self.get_user_station_id(request.user)
        return attendant_station_id == station.id
    
    
class IsOwnerOrManagerOfStation(permissions.BasePermission):
    def has_permission(self, request, view):
        station_id = request.data.get('station')
        if hasattr(request.user, 'owner'):
            station_name = cache.get(f"owner_{request.user.id}_station_{station_id}")
            if not station_name:
                return False
            station = Station.objects.get(id=station_id, owner=request.user)
        elif hasattr(request.user, 'is_manager'):
            manager_id = request.user.id
            station_id_cache = cache.get(f"manager_station_{manager_id}")
            if station_id != station_id_cache:
                return False
            station = Station.objects.get(id=station_id)
        else:
            return False
        return True
