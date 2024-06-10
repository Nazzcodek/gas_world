from rest_framework import serializers
from sales.models import Sales
from product.models import PumpReading
from station_attendant.models import Attendant


class SalesSerializer(serializers.ModelSerializer):
    pump_reading_name = serializers.SerializerMethodField()
    attendant_name = serializers.SerializerMethodField()

    class Meta:
        model = Sales
        fields = [
            'id',
            'pump_reading_name',
            'attendant_name',
            'cash',
            'transfer',
            'pos',
            'expenses',
            'shortage_or_excess',
            'timestamp',
            'is_active',
            'created_at',
            'updated_at'
            ]

    def get_attendant_name(self, obj):
        return obj.attendant.name if obj.attendant else None

    def get_pump_reading_name(self, obj):
        try:
            pump_reading = PumpReading.objects.get(id=obj.pump_reading_id)
            pump_name = pump_reading.pump.name
            return pump_name
        except PumpReading.DoesNotExist:
            return "PumpReading not found"
