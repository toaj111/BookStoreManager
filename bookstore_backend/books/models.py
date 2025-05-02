from django.db import models
from django.utils import timezone

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='分类名称')
    description = models.TextField(blank=True, verbose_name='描述')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '图书分类'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name

class Book(models.Model):
    STATUS_CHOICES = (
        ('in_stock', '在库'),
        ('out_of_stock', '缺货'),
        ('discontinued', '停售'),
    )

    title = models.CharField(max_length=200, verbose_name='书名')
    author = models.CharField(max_length=100, verbose_name='作者')
    publisher = models.CharField(max_length=100, verbose_name='出版社')
    isbn = models.CharField(max_length=13, unique=True, verbose_name='ISBN')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, verbose_name='分类')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='价格')
    stock = models.IntegerField(default=0, verbose_name='库存')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_stock', verbose_name='状态')
    description = models.TextField(blank=True, verbose_name='描述')
    cover = models.ImageField(upload_to='book_covers/', null=True, blank=True, verbose_name='封面')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '图书'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.title

class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('pending', '未付款'),
        ('paid', '已付款'),
        ('returned', '已退货'),
    )

    book = models.ForeignKey(Book, on_delete=models.CASCADE, verbose_name='图书')
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='进货价格')
    quantity = models.IntegerField(verbose_name='数量')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='状态')
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, verbose_name='创建人')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '进货订单'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.book.title} - {self.quantity}本"
