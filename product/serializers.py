from rest_framework import serializers
from product.models import Product, Pump, PumpReading
from station.models import Station
from station_attendant.models import Attendant

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PumpSerializer(serializers.ModelSerializer):
    station = serializers.PrimaryKeyRelatedField(queryset=Station.objects.all())
    product_type = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Pump
        fields = ['id', 'name', 'station', 'product_type', 'initial_meter', 'created_at', 'updated_at']

class PumpReadingSerializer(serializers.ModelSerializer):
    pump = serializers.SlugRelatedField(slug_field='name', queryset=Pump.objects.all())
    attendant = serializers.SlugRelatedField(slug_field='name', queryset=Attendant.objects.all())

    class Meta:
        model = PumpReading
        fields = ['id', 'pump', 'attendant', 'opening_meter', 'closing_meter', 'timestamp', 'liters_sold', 'rate', 'amount']
        read_only_fields = ['liters_sold', 'amount']