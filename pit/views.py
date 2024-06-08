from rest_framework import viewsets, permissions, serializers
from rest_framework.response import Response
from .models import PitReading, Pit
from product.models import Pump
from .serializers import PitSerializer, PitReadingSerializer
from owner.permissions import IsStationOwner, IsAuthenticatedManager
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class PitViewSet(viewsets.ModelViewSet):
    queryset = Pit.objects.all()
    serializer_class = PitSerializer
    permission_classes_by_action = {
        'create': [IsStationOwner | IsAuthenticatedManager],
        'retrieve': [IsStationOwner | IsAuthenticatedManager],
        'list': [IsStationOwner | IsAuthenticatedManager],
        'update': [IsAuthenticatedManager],
        'partial_update': [IsAuthenticatedManager],
        'destroy': [IsStationOwner],
    }

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        station_id = self.request.data.get('station')
        if not station_id:
            raise serializers.ValidationError("Station ID must be provided.")
        serializer.save()

    def by_station(self, request, station_id=None):
        try:
            pits = Pit.objects.filter(station__id=station_id)
            serializer = self.get_serializer(pits, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching Pits"}, status=500)
            
    def by_product(self, request, product_id=None):
        try:
            pits = Pit.objects.filter(pit_product__id=product_id)
            serializer = self.get_serializer(pits, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(str(e)) 
            return Response({"error": "Error fetching Pits"}, status=500)


class PitReadingViewSet(viewsets.ModelViewSet):
    queryset = PitReading.objects.all()
    serializer_class = PitReadingSerializer
    permission_classes_by_action = {
        'create': [IsStationOwner | IsAuthenticatedManager],
        'retrieve': [IsStationOwner | IsAuthenticatedManager],
        'list': [IsStationOwner | IsAuthenticatedManager],
        'update': [IsAuthenticatedManager],
        'partial_update': [IsAuthenticatedManager],
        'destroy': [IsStationOwner],
    }

    def get_permissions(self):
        try:
            return [permission() for permission in self.permission_classes_by_action[self.action]]
        except KeyError:
            return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        pit_id = self.request.data.get('reading_pit')
        if not pit_id:
            raise serializers.ValidationError("Pit ID must be provided.")

        pit = cache.get(f"pit_{pit_id}")
        if pit is None:
            try:
                pit = Pit.objects.get(id=pit_id)
                cache.set(f"pit_{pit_id}", pit, timeout=3600)  # Cache for 1 hour
            except Pit.DoesNotExist:
                raise serializers.ValidationError("Pit ID not found.")

        serializer.save(reading_pit=pit)

    def perform_update(self, serializer):
        instance = self.get_object()
        actual_closing_stock = self.request.data.get('actual_closing_stock')
        if actual_closing_stock is not None:
            pit_id = instance.reading_pit.id
            pit = cache.get(f"pit_{pit_id}")

            if pit is None:
                try:
                    pit = Pit.objects.get(id=pit_id)
                    cache.set(f"pit_{pit_id}", pit, timeout=3600)  # Cache for 1 hour
                except Pit.DoesNotExist:
                    raise serializers.ValidationError("Pit ID not found.")

            instance.actual_closing_stock = actual_closing_stock
            instance.save()
        else:
            raise serializers.ValidationError("Actual closing stock must be provided for update.")

        serializer.save()

    def by_station(self, request, station_id=None):
        try:
            pit_readings = PitReading.objects.filter(reading_pit__station__id=station_id)
            serializer = self.get_serializer(pit_readings, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": "Error fetching pits"}, status=500)

    def by_pit(self, request, pit_id=None):
        logger.info(f"Fetching pit readings for pit ID: {pit_id}")
        try:
            pit_readings = PitReading.objects.filter(reading_pit__id=pit_id)
            serializer = self.get_serializer(pit_readings, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": "Error fetching pits"}, status=500)

    def by_pump(self, request, pump_id=None):
        try:
            pump = Pump.objects.get(id=pump_id)
            pit_readings = PitReading.objects.filter(reading_pit=pump.pump_pit)
            serializer = self.get_serializer(pit_readings, many=True)
            return Response(serializer.data)
        except Pump.DoesNotExist:
            return Response({"error": "Pump not found"}, status=404)
        except Exception as e:
            logger.error(f"Error fetching pit readings for pump {pump_id}: {e}", exc_info=True)
            return Response({"error": "Error fetching pit readings"}, status=500)