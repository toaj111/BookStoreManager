from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# Create your models here.

class Category(models.Model):
    name = models.CharField(_('分类名称'), max_length=100, unique=True)
    description = models.TextField(_('描述'), blank=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        verbose_name = _('图书分类')
        verbose_name_plural = _('图书分类')
        ordering = ['name']

    def __str__(self):
        return self.name

class Book(models.Model):
    STATUS_CHOICES = (
        ('in_stock', '在库'),
        ('out_of_stock', '缺货'),
        ('discontinued', '停售'),
    )

    title = models.CharField(_('书名'), max_length=200)
    author = models.CharField(_('作者'), max_length=100)
    publisher = models.CharField(max_length=100, verbose_name='出版社')
    isbn = models.CharField(_('ISBN'), max_length=13, unique=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('分类'))
    price = models.DecimalField(_('价格'), max_digits=10, decimal_places=2)
    stock = models.IntegerField(_('库存'), default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_stock', verbose_name='状态')
    description = models.TextField(_('描述'), blank=True)
    cover = models.ImageField(upload_to='book_covers/', null=True, blank=True, verbose_name='封面')
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        verbose_name = _('图书')
        verbose_name_plural = _('图书')
        ordering = ['title']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # 确保库存不为负数
        if self.stock < 0:
            self.stock = 0
        super().save(*args, **kwargs)

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
