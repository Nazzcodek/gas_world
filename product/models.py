from django.db import models
from uuid import uuid4
from station.models import Station
from datetime import timezone


class BaseModel(models.Model):
    id = models.UUIDField(default=uuid4, editable=False, unique=True, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Product(BaseModel):
    name = models.CharField(max_length=50)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()


class Pump(BaseModel):
    name = models.CharField(max_length=50)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='pumps')
    product_type = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pumps')
    initial_meter = models.DecimalField(max_digits=10, decimal_places=2)


class PumpReading(models.Model):
    pump = models.ForeignKey(Pump, on_delete=models.CASCADE, related_name='readings')
    attendant = models.ForeignKey('station_attendant.Attendant', on_delete=models.CASCADE)
    opening_meter = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    closing_meter = models.DecimalField(max_digits=10, decimal_places=2)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.opening_meter:
            last_reading = PumpReading.objects.filter(pump=self.pump).order_by('-timestamp').first()
            if last_reading:
                self.opening_meter = last_reading.closing_meter
            else:
                self.opening_meter = self.pump.initial_meter
        if self.closing_meter and not self.timestamp:
            self.timestamp = timezone.now()
        super().save(*args, **kwargs)

    @property
    def liters_sold(self):
        return self.closing_meter - self.opening_meter

    @property
    def amount(self):
        return self.liters_sold * self.rate


class Pit(BaseModel):
    pit_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pits')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='pits')
    current_volume = models.FloatField(default=0)  # Track current volume
    max_volume = models.FloatField()  # Maximum volume the pit can hold

    def update_volume(self, amount):
        self.current_volume += amount
        self.save()


class PitReading(BaseModel):
    reading_pit = models.ForeignKey(Pit, on_delete=models.CASCADE, related_name='readings')
    supply = models.FloatField()
    opening_stock = models.FloatField()
    closing_stock = models.FloatField()
    actual_closing_stock = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(null=True, blank=True)

    @property
    def excess_or_shortage(self):
        if self.actual_closing_stock is not None:
            return self.actual_closing_stock - self.closing_stock
        return None

    def save(self, *args, **kwargs):
        if not self.opening_stock:
            self.opening_stock = self.pit.current_volume
        if not self.timestamp:
            self.timestamp = timezone.now()
        super().save(*args, **kwargs)

