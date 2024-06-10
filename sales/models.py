from django.db import models
from decimal import Decimal
from uuid import uuid4
from django.db import transaction


class Sales(models.Model):
    id = models.UUIDField(
        default=uuid4,
        editable=False,
        unique=True,
        primary_key=True)
    station = models.ForeignKey(
        'station.Station',
        on_delete=models.CASCADE,
        related_name='sales'
        )
    pump_reading = models.OneToOneField(
        'product.PumpReading',
        on_delete=models.CASCADE,
        related_name='sales'
        )
    attendant = models.ForeignKey(
        'station_attendant.Attendant',
        on_delete=models.CASCADE
        )
    cash = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
        )
    transfer = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
        )
    pos = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
        )
    expenses = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
        )
    shortage_or_excess = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
        )
    timestamp = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        cash_flow = Decimal(
            self.cash + self.transfer + self.pos + self.expenses
            )
        pump_reading_amount = Decimal(self.pump_reading.amount)
        self.shortage_or_excess = pump_reading_amount - cash_flow
        super().save(*args, **kwargs)

        if not self.is_active:
            with transaction.atomic():
                pump_reading = self.pump_reading
                if pump_reading.status != 'COMPLETED':
                    pump_reading.status = 'COMPLETED'
                    pump_reading.save()
