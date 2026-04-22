from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ADMIN = 'ADMIN'
    PROVIDER = 'PROVIDER'
    CUSTOMER = 'CUSTOMER'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (PROVIDER, 'Provider'),
        (CUSTOMER, 'Customer'),
    ]
    
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=CUSTOMER)

class PasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.email} - {self.otp}"