from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
import hashlib

class User(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Regular Admin'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    employee_id = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True)

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('md5$'):
            # Hash password using MD5 before saving
            self.password = f"md5${hashlib.md5(self.password.encode()).hexdigest()}"
        super().save(*args, **kwargs)

class Book(models.Model):
    isbn = models.CharField(max_length=13, unique=True)
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    publisher = models.CharField(max_length=200)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    current_stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.isbn})"

class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    )

    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_amount(self):
        return self.quantity * self.purchase_price

class Sale(models.Model):
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_amount(self):
        return self.quantity * self.sale_price

class FinancialTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('purchase', 'Book Purchase'),
        ('sale', 'Book Sale'),
        ('refund', 'Refund'),
    )

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reference_id = models.CharField(max_length=50)  # Can reference either purchase or sale ID
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.created_at})"
