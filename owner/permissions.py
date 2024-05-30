from rest_framework import permissions
from django.core.cache import cache
from station.models import Station
from manager.models import Manager
from owner.models import Owner
from station_attendant.models import Attendant
from product.models import Product, Pump

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
        else:
            return False  # Object is neither a Station nor a Manager

        # Check if the user owns the station
        return station.owner == owner


class IsAuthenticatedManager(permissions.BasePermission):
    """Allows access only to authenticated managers of the current station."""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if view.action == 'create':
            try:
                # Check if the user is a manager
                Manager.objects.get(pk=request.user.pk)
                return True
            except Manager.DoesNotExist:
                return False
        
        return super().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Check if the user is a manager 
        try:
            manager = Manager.objects.get(pk=request.user.pk)
        except Manager.DoesNotExist:
            return False  # User is not a manager

        # Check if manager's station matches the current station
        manager_station_cache_key = f"manager_station_{manager.id}"
        manager_station_id = cache.get(manager_station_cache_key)
        
        if manager_station_id is None:
            manager_station_id = manager.station_id
            cache.set(manager_station_cache_key, manager_station_id, timeout=3600)

        return manager_station_id == obj.station_id


class IsAuthenticatedAttendant(permissions.BasePermission):
    """Allows access only to authenticated attendants of the current station."""

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        # Check if the user is an attendant using cached value
        is_attendant_cache_key = f"is_attendant_{request.user.id}"
        is_attendant = cache.get(is_attendant_cache_key)
        if is_attendant is None:
            # Cache miss: Fetch from the database and store in cache
            try:
                Attendant.objects.get(pk=request.user.pk)
                is_attendant = True
            except Attendant.DoesNotExist:
                is_attendant = False

            cache.set(is_attendant_cache_key, is_attendant, timeout=3600)

        if not is_attendant:
            return False  # User is not an attendant, no access

        # Check if attendant's station matches the current station
        attendant_station_cache_key = f"attendant_station_{request.user.id}"
        attendant_station_id = cache.get(attendant_station_cache_key)

        if attendant_station_id is None:
            attendant_station_id = request.user.station_id
            cache.set(attendant_station_cache_key, attendant_station_id, timeout=3600)

        # Ensure obj has a station attribute (for related models like AttendantShifts)
        if hasattr(obj, 'station'):
            return attendant_station_id == obj.station_id

        return False


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