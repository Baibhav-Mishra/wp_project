# stocks/models.py

from django.db import models

class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    current_price = models.FloatField()
    volume = models.BigIntegerField()
    previous_close = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.symbol
