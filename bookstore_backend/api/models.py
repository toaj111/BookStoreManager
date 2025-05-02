from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import MinValueValidator
import hashlib
import uuid
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', '管理员'),
        ('manager', '经理'),
        ('staff', '普通员工'),
    ]
    
    GENDER_CHOICES = [
        ('M', '男'),
        ('F', '女'),
        ('O', '其他'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff', verbose_name='角色')
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='O', verbose_name='性别')
    phone = models.CharField(max_length=20, blank=True, verbose_name='电话')
    hire_date = models.DateField(null=True, blank=True, verbose_name='入职日期')
    
    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'
        permissions = [
            ('view_all_books', '可以查看所有图书'),
            ('manage_books', '可以管理图书'),
            ('view_all_sales', '可以查看所有销售记录'),
            ('manage_sales', '可以管理销售'),
            ('view_all_purchases', '可以查看所有采购记录'),
            ('manage_purchases', '可以管理采购'),
            ('view_all_financials', '可以查看所有财务记录'),
            ('manage_financials', '可以管理财务'),
            ('manage_users', '可以管理用户'),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def has_permission(self, permission_codename):
        if self.is_superuser:
            return True
        return self.user_permissions.filter(codename=permission_codename).exists() or \
               self.groups.filter(permissions__codename=permission_codename).exists()
    
    def get_role_permissions(self):
        if self.role == 'admin':
            return Permission.objects.all()
        elif self.role == 'manager':
            return Permission.objects.filter(
                codename__in=[
                    'view_all_books', 'manage_books',
                    'view_all_sales', 'manage_sales',
                    'view_all_purchases', 'manage_purchases',
                    'view_all_financials', 'manage_financials',
                ]
            )
        else:  # staff
            return Permission.objects.filter(
                codename__in=[
                    'view_all_books',
                    'view_all_sales',
                    'view_all_purchases',
                    'view_all_financials',
                ]
            )

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
