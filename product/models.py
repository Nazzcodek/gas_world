from django.db import models
from product.service import BaseModel
from station.models import Station
from sales.models import Sales
from pit.models import PitReading
from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
# from pit.models import Pit


class Product(BaseModel):
    name = models.CharField(max_length=50)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()


class Pump(BaseModel):
    name = models.CharField(max_length=50)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='pumps')
    product_type = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pumps')
    initial_meter = models.DecimalField(max_digits=10, decimal_places=2)
    pump_pit = models.ForeignKey('pit.Pit', on_delete=models.CASCADE, related_name='pumps')


class PumpReading(BaseModel):
    STATUS_CHOICES = [
        ('ACCEPTED', 'Accepted'),
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
    ]
    pump = models.ForeignKey(Pump, on_delete=models.CASCADE, related_name='readings')
    attendant = models.ForeignKey('station_attendant.Attendant', on_delete=models.CASCADE)
    opening_meter = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    closing_meter = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    rate = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    timestamp = models.DateTimeField(auto_now_add=True)

    @transaction.atomic
    def save(self, *args, **kwargs):
        if self.opening_meter is None:
            last_reading = PumpReading.objects.filter(pump=self.pump).order_by('-timestamp').first()
            self.opening_meter = last_reading.closing_meter if last_reading else self.pump.initial_meter
        super().save(*args, **kwargs)

        if not hasattr(self, 'sales'):
            self.create_sales_record()
        if not hasattr(self, 'pit_reading'):
            self.create_pit_reading()

    @property
    def liters_sold(self):
        return self.closing_meter - self.opening_meter

    @property
    def amount(self):
        return Decimal(self.liters_sold) * self.rate

    def create_sales_record(self):
        print(f"Creating sales record for pump reading ID {self.id}")
        if Sales.objects.filter(pump_reading_id=self.id).exists():
            print(f"Sales record already exists for pump reading ID {self.id}")
            raise ValidationError("Pump reading ID already exists")
        else:
            Sales.objects.create(
                pump_reading=self,
                attendant=self.attendant,
                station=self.pump.station
            )
            print(f"Sales record created for pump reading ID {self.id}")

    def create_pit_reading(self):
        reading_pit = self.pump.pump_pit
        opening_stock = self.pump.pump_pit.current_volume
        PitReading.objects.create(reading_pit=reading_pit, opening_stock=opening_stock)
