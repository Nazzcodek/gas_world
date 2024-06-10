from rest_framework import serializers
from .models import Pit, PitReading
from product.models import Product


class PitSerializer(serializers.ModelSerializer):
    pit_product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all()
        )
    product_name = serializers.SerializerMethodField()

    class Meta:
        model = Pit
        fields = [
            'id',
            'name',
            'pit_product',
            'station',
            'current_volume',
            'max_volume',
            'product_name',
            'created_at',
            'updated_at'
            ]

    def get_product_name(self, obj):
        return obj.pit_product.name


class PitReadingSerializer(serializers.ModelSerializer):
    pit_name = serializers.SerializerMethodField()

    class Meta:
        model = PitReading
        fields = [
            'id', 'reading_pit', 'supply', 'opening_stock', 'closing_stock',
            'actual_closing_stock', 'excess_or_shortage', 'timestamp',
            'created_at', 'updated_at', 'pit_name'
        ]
        read_only_fields = [
            'reading_pit',
            'excess_or_shortage',
            'opening_stock',
            'timestamp',
            'closing_stock',
            'supply'
            ]

    def get_pit_name(self, obj):
        return obj.reading_pit.name

    def create(self, validated_data):
        pit = validated_data['reading_pit']
        validated_data['opening_stock'] = pit.current_volume
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.actual_closing_stock = validated_data.get(
            'actual_closing_stock',
            instance.actual_closing_stock
            )
        instance.save()
        return instance
