from django.db import models
from .service import BaseModel
from station.models import Station
from decimal import Decimal


class Pit(BaseModel):
    name = models.CharField(max_length=50, default=None)
    pit_product = models.ForeignKey('product.Product', on_delete=models.CASCADE, related_name='pits')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='pits')
    current_volume = models.FloatField(default=0)
    max_volume = models.FloatField()

    def update_volume(self, amount):
        self.current_volume += amount
        self.save()


class PitReading(BaseModel):
    reading_pit = models.ForeignKey(Pit, on_delete=models.CASCADE, related_name='readings')
    supply = models.FloatField(default=0)
    opening_stock = models.FloatField()
    closing_stock = models.FloatField()
    actual_closing_stock = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    @property
    def excess_or_shortage(self):
        if self.actual_closing_stock is not None:
            actual_closing_stock_decimal = Decimal(str(self.actual_closing_stock))
            closing_stock_decimal = Decimal(str(self.closing_stock))
            return actual_closing_stock_decimal - closing_stock_decimal
        return None
    
    def save(self, *args, **kwargs):
        if not self.opening_stock:
            self.opening_stock = self.reading_pit.current_volume
        self.closing_stock = self.calculate_closing_stock()

        if self.actual_closing_stock and self.actual_closing_stock > self.opening_stock:
            self.supply = self.actual_closing_stock - self.opening_stock
            self.closing_stock = self.actual_closing_stock
        else:
            self.supply = 0
        
        super().save(*args, **kwargs)

    def calculate_closing_stock(self):
        from django.apps import apps
        Pump = apps.get_model('product', 'Pump')
        pumps = Pump.objects.filter(pump_pit=self.reading_pit)
        liters_sold = sum(pump_reading.liters_sold for pump in pumps for pump_reading in pump.readings.all())
        return Decimal(self.opening_stock) - liters_sold