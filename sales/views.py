from rest_framework import viewsets, serializers, permissions
from rest_framework.response import Response
from sales.models import Sales
from sales.serializers import SalesSerializer
from station_attendant.models import Attendant
from manager.models import Manager
from django.core.exceptions import ObjectDoesNotExist
from django.core.cache import cache
from owner.permissions import IsAuthenticatedManager, IsAuthenticatedAttendant, IsStationOwner
from product.models import PumpReading
import logging as logger

logger = logger.getLogger(__name__)

class SalesView(viewsets.ModelViewSet):
    queryset = Sales.objects.all()
    serializer_class = SalesSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticatedManager()]
        elif self.action == 'list':
            return [IsAuthenticatedManager() | IsStationOwner()]
        elif self.action == 'retrieve':
            return [IsAuthenticatedManager() | IsAuthenticatedAttendant()]
        elif self.action == 'update' or self.action == 'partial_update':
            if 'is_active' in self.request.data:
                return [IsAuthenticatedManager()]
            else:
                return [permissions.OR(IsAuthenticatedManager(), IsAuthenticatedAttendant())]
        else:
            return super().get_permissions()

    def perform_update(self, serializer):
        sales_instance = self.get_object()
        if 'is_active' in self.request.data:
            print(self.request.data)
            user = self.request.user
            if not user.is_authenticated or not Manager.objects.filter(pk=user.pk).exists():
                raise serializers.ValidationError("Only managers can close the sales.")
            sales_instance.is_active = self.request.data['is_active']
            sales_instance.save()
        try:
            attendant = Attendant.objects.get(user_ptr_id=self.request.user.id)
            serializer.save(attendant=attendant)
        except ObjectDoesNotExist:
            serializer.save()

    def by_station(self, request, station_id=None):
        try:
            sales = Sales.objects.filter(station__id=station_id)
            serializer = self.get_serializer(sales, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": "Error fetching sales"}, status=500)
        
    def by_pump(self, request, pump_id=None):
        try:
            pump_readings = PumpReading.objects.filter(pump_id=pump_id)
            sales = Sales.objects.filter(pump_reading__in=pump_readings)
            serializer = self.get_serializer(sales, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Log the exception details to help with debugging
            logger.exception("Failed to fetch sales for pump_id %s", pump_id)
            return Response({"error": "Error fetching sales"}, status=500)
        
    def by_attendant(self, request, attendant_id=None):
        try:
            sales = Sales.objects.filter(attendant__id=attendant_id)
            serializer = self.get_serializer(sales, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": "Error fetching sales"}, status=500)
