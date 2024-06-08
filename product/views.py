from rest_framework import viewsets
from product.models import Product, Pump, PumpReading
from product.serializers import ProductSerializer, PumpSerializer, PumpReadingSerializer
from owner.permissions import IsStationOwner, IsAuthenticatedManager, IsAuthenticatedAttendant
from station.models import Station
from manager.models import Manager
from rest_framework import serializers
from station_attendant.models import Attendant
from django.core.cache import cache
from rest_framework.response import Response
from pit.models import Pit


class BaseViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        station_id = self.request.data.get('station')

        if not station_id:
            raise serializers.ValidationError("Station ID must be provided.")

        if hasattr(self.request.user, 'owner'):
            station_name = cache.get(f"owner_{self.request.user.id}_station_{station_id}")
            print(station_name)
            if not station_name:
                raise serializers.ValidationError("Invalid station ID or you do not own this station.")
            station = Station.objects.get(id=station_id, owner=self.request.user)
        else:
            try:
                manager = Manager.objects.get(user_ptr=self.request.user)
            except Manager.DoesNotExist:
                raise serializers.ValidationError("You do not have permission to create this resource.")
            
            try:
                station = Station.objects.get(id=station_id, manager=manager)
            except Station.DoesNotExist:
                raise serializers.ValidationError("You do not manage this station.")

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


class PumpViewSet(viewsets.ModelViewSet):
    queryset = Pump.objects.all()
    serializer_class = PumpSerializer
    permission_classes = [IsStationOwner | IsAuthenticatedManager]

    def perform_create(self, serializer):
        station_id = self.request.data.get('station')
        pump_pit_id = self.request.data.get('pump_pit')
        if not station_id:
            raise serializers.ValidationError("Station ID must be provided.")
        if not pump_pit_id:
            raise serializers.ValidationError("Pump Pit ID must be provided.")
        
        try:
            station = Station.objects.get(id=station_id)
        except Station.DoesNotExist:
            raise serializers.ValidationError("Station does not exist.")
        
        try:
            pump_pit = Pit.objects.get(id=pump_pit_id)
        except Pit.DoesNotExist:
            raise serializers.ValidationError("Pump Pit does not exist.")
        
        serializer.save(station=station, pump_pit=pump_pit)

    def perform_update(self, serializer):
        instance = self.get_object()
        pit_id = self.request.data.get('pump_pit')
        
        if pit_id:
            try:
                pump_pit = Pit.objects.get(id=pit_id)
            except Pit.DoesNotExist:
                raise serializers.ValidationError("Pit does not exist.")
            serializer.save(pump_pit=pump_pit)
        else:
            serializer.save()

    def by_station(self, request, station_id=None):
        try:
            pumps = Pump.objects.filter(station__id=station_id)
            serializer = self.get_serializer(pumps, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching Pumps"}, status=500)
        
    def by_pump_pit(self, request, pump_pit_id=None):
        try:
            pumps = Pump.objects.filter(pump_pit__id=pump_pit_id)
            serializer = self.get_serializer(pumps, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching Pumps"}, status=500)
        
    def by_product(self, request, product_id=None):
        try:
            pumps = Pump.objects.filter(product_type__id=product_id)
            serializer = self.get_serializer(pumps, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e))
            return Response({"error": "Error fetching Pumps"}, status=500)


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
        print("create method called")
        manager_id = self.request.user.id
        attendant_id = cache.get(f"manager_{manager_id}_attendant_{self.request.data['attendant']}")
        print(f"Received data: {self.request.data}")

        if attendant_id is None:
            try:
                attendant = Attendant.objects.get(id=self.request.data['attendant'])
                cache.set(f"manager_{manager_id}_attendant_{attendant.id}", attendant.id, timeout=3600)  # Cache for 1 hour
            except Attendant.DoesNotExist:
                raise serializers.ValidationError("Attendant ID not found.")
        else:
            attendant = Attendant.objects.get(id=attendant_id)

        serializer.save(attendant=attendant)


    def perform_update(self, serializer):
        current_pump_reading = self.get_object()
        last_pump_reading = PumpReading.objects.filter(pump=current_pump_reading.pump).order_by('-timestamp').first()

        if last_pump_reading and last_pump_reading.attendant and last_pump_reading.closing_meter is None:
            raise serializers.ValidationError("Rate can't be changed while a pump activity is ongoing")

        if 'closing_meter' in self.request.data:
            pump_reading_id = current_pump_reading.id
            attendant_id = self.request.user.id
            cached_pump_readings = cache.get(f"attendant_{attendant_id}_pump_readings")

            if cached_pump_readings is None:
                # Fall back to database if Redis cache fails
                pump_reading_exists = PumpReading.objects.filter(id=pump_reading_id, attendant_id=attendant_id).exists()
                if not pump_reading_exists:
                    raise serializers.ValidationError("Only the assigned attendant can input the closing meter")
            elif pump_reading_id not in cached_pump_readings:
                raise serializers.ValidationError("Only the assigned attendant can input the closing meter")

        serializer.save()


    def get_pump_readings(self, filter_field, filter_value):
        try:
            filter_kwargs = {f'{filter_field}__id': filter_value}
            pump_readings = PumpReading.objects.filter(**filter_kwargs)
            serializer = self.get_serializer(pump_readings, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching pump readings"}, status=500)

    def by_station(self, request, station_id=None):
        try:
            pump_readings = PumpReading.objects.filter(pump__station__id=station_id)
            serializer = self.get_serializer(pump_readings, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching pump readings"}, status=500)

    def by_pump(self, request, pump_id=None):
        return self.get_pump_readings('pump', pump_id)

    def by_attendant(self, request, attendant_id=None):
        return self.get_pump_readings('attendant', attendant_id)
