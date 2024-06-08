from rest_framework import serializers
from product.models import Product, Pump, PumpReading
from station.models import Station
from station_attendant.models import Attendant
from pit.models import Pit


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PumpSerializer(serializers.ModelSerializer):
    station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all())
    product_type = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    pump_pit = serializers.PrimaryKeyRelatedField(queryset=Pit.objects.all())
    product_name = serializers.SerializerMethodField()
    pit_name = serializers.SerializerMethodField()

    class Meta:
        model = Pump
        fields = ['id', 'name', 'station', 'product_type', 'product_name', 'initial_meter', 'pump_pit', 'pit_name', 'created_at', 'updated_at']

    def get_product_name(self, obj):
        return obj.product_type.name

    def get_pit_name(self, obj):
        return obj.pump_pit.name



class PumpReadingSerializer(serializers.ModelSerializer):
    attendant_name = serializers.SerializerMethodField()
    pump_name = serializers.SerializerMethodField()

    class Meta:
        model = PumpReading
        fields = [
            'id',
            'pump',
            'attendant',
            'opening_meter',
            'closing_meter',
            'timestamp',
            'liters_sold',
            'rate',
            'amount',
            'attendant_name',
            'pump_name',
            'status',
            'created_at',
            'updated_at',
            'updated_at'
            ]
        read_only_fields = ['liters_sold', 'amount']

    def get_attendant_name(self, obj):
        return obj.attendant.name

    def get_pump_name(self, obj):
        return obj.pump.name

    def create(self, validated_data):
        pump = validated_data.get('pump')
        rate = validated_data.get('rate')

        if rate is None:
            last_reading = PumpReading.objects.filter(pump=pump).order_by('-timestamp').first()
            if last_reading:
                rate = last_reading.rate
            else:
                rate = 0

            validated_data['rate'] = rate

        return super().create(validated_data)
