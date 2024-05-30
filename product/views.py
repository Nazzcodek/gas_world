from rest_framework import viewsets
from product.models import Product, Pump, PumpReading
from product.serializers import ProductSerializer, PumpSerializer, PumpReadingSerializer
from owner.permissions import IsStationOwner, IsAuthenticatedManager, IsAuthenticatedAttendant, IsOwnerOrManagerOfStation
from station.models import Station
from rest_framework import serializers
from station_attendant.models import Attendant
from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.response import Response


class BaseViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        station_id = self.request.data.get('station')

        if not station_id:
            raise serializers.ValidationError("Station ID must be provided.")

        if hasattr(self.request.user, 'owner'):
            station_name = cache.get(f"owner_{self.request.user.id}_station_{station_id}")
            if not station_name:
                raise serializers.ValidationError("Invalid station ID or you do not own this station.")
            station = Station.objects.get(id=station_id, owner=self.request.user)
        elif hasattr(self.request.user, 'is_manager'):
            manager_id = self.request.user.id
            station_id_cache = cache.get(f"manager_station_{manager_id}")
            if station_id != station_id_cache:
                raise serializers.ValidationError("You do not manage this station.")
            station = Station.objects.get(id=station_id)
        else:
            raise serializers.ValidationError("You do not have permission to create this resource.")

        serializer.save(station=station)


class ProductViewSet(BaseViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsStationOwner | IsAuthenticatedManager]

    def by_station(self, request, station_id=None):
        try:
            products = Product.objects.filter(station__id=station_id)
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching Products"}, status=500)

    

class PumpViewSet(BaseViewSet):
    queryset = Pump.objects.all()
    serializer_class = PumpSerializer
    permission_classes = [IsStationOwner | IsAuthenticatedManager]
    # permission_classes = [IsOwnerOrManagerOfStation]

    def by_station(self, request, station_id=None):
        try:
            pumps = Pump.objects.filter(station__id=station_id)
            serializer = self.get_serializer(pumps, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching Pumps"}, status=500)

    # def perform_update(self, serializer):
    #     last_pump_reading = self.get_object().readings.order_by('-timestamp').first()
    #     if last_pump_reading and last_pump_reading.attendant and last_pump_reading.closing_meter is None:
    #         raise serializers.ValidationError("Rate can't be changed while a pump activity is ongoing")
    #     else:
    #         serializer.save()


class PumpReadingViewSet(viewsets.ModelViewSet):
    queryset = PumpReading.objects.all()
    serializer_class = PumpReadingSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [IsAuthenticatedManager]
        elif self.action in ['update', 'partial_update']:
            self.permission_classes = [IsAuthenticatedManager | IsAuthenticatedAttendant]
        else:
            self.permission_classes = [IsStationOwner | IsAuthenticatedManager]
        return super().get_permissions()

    def perform_create(self, serializer):
        manager_id = self.request.user.id
        attendant_id = cache.get(f"manager_{manager_id}_attendant_{self.request.data['attendant']}")

        if attendant_id is None:
            attendant = Attendant.objects.filter(id=self.request.data['attendant']).first()
            if not attendant:
                raise serializers.ValidationError("Attendant ID not found.")
        else:
            attendant = Attendant.objects.get(id=attendant_id)

        serializer.save(attendant=attendant)

    def perform_update(self, serializer):
        last_pump_reading = self.get_object().readings.order_by('-timestamp').first()
        if last_pump_reading and last_pump_reading.attendant and last_pump_reading.closing_meter is None:
            raise serializers.ValidationError("Rate can't be changed while a pump activity is ongoing")

        if 'closing_meter' in self.request.data:
            pump_reading_id = self.get_object().id
            attendant_id = self.request.user.id
            cached_pump_readings = cache.get(f"attendant_{attendant_id}_pump_readings")

            if cached_pump_readings is None:
                # Fall back to database if Redis cache fails
                pump_reading = PumpReading.objects.filter(id=pump_reading_id, attendant_id=attendant_id).exists()
                if not pump_reading:
                    raise serializers.ValidationError("Only the assigned attendant can input the closing meter")
            elif pump_reading_id not in cached_pump_readings:
                raise serializers.ValidationError("Only the assigned attendant can input the closing meter")

        serializer.save()

    # def perform_update(self, serializer):
    #     if 'closing_meter' in self.request.data:
    #         pump_reading_id = self.get_object().id
    #         attendant_id = self.request.user.id
    #         cached_pump_readings = cache.get(f"attendant_{attendant_id}_pump_readings")

    #         if cached_pump_readings is None:
    #             # Fall back to database if Redis cache fails
    #             pump_reading = PumpReading.objects.filter(id=pump_reading_id, attendant_id=attendant_id).exists()
    #             if not pump_reading:
    #                 raise serializers.ValidationError("Only the assigned attendant can input the closing meter")
    #         elif pump_reading_id not in cached_pump_readings:
    #             raise serializers.ValidationError("Only the assigned attendant can input the closing meter")

    #     serializer.save()