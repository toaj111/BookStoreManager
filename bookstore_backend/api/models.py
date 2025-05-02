from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
import hashlib
import uuid

class User(AbstractUser):
    employee_id = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=[
        ('super_admin', '超级管理员'),
        ('admin', '管理员'),
    ])
    phone = models.CharField(max_length=20, blank=True) # 电话
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True) # 性别

    def set_password(self, raw_password):
        if raw_password:
            # 使用MD5加密密码
            self.password = f"md5${hashlib.md5(raw_password.encode()).hexdigest()}"
        else:
            self.password = raw_password

    def check_password(self, raw_password):
        if not raw_password or not self.password:
            return False
        if not self.password.startswith('md5$'):
            return False
        stored_hash = self.password[4:]  # 去掉 'md5$' 前缀
        return stored_hash == hashlib.md5(raw_password.encode()).hexdigest()

class Book(models.Model):
    isbn = models.CharField(max_length=13, unique=True)
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    publisher = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock_quantity = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.isbn})"

class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', '待付款'),
        ('paid', '已付款'),
    ]

    order_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"PO-{uuid.uuid4().hex[:8].upper()}"
        self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number}"

class Sale(models.Model):
    STATUS_CHOICES = [
        ('completed', '已完成'),
        ('returned', '已退货'),
    ]

    sale_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    book = models.ForeignKey(Book, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.sale_number:
            self.sale_number = f"SALE-{uuid.uuid4().hex[:8].upper()}"
        self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sale_number}"

def generate_transaction_number():
    return f"TR-{uuid.uuid4().hex[:8].upper()}"

class FinancialTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', '收入'),
        ('expense', '支出'),
    ]

    transaction_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    related_order = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True)
    related_sale = models.ForeignKey(Sale, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.transaction_number:
            self.transaction_number = f"TR-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_number} - {self.transaction_type} - {self.amount}"
