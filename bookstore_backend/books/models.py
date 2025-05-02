from django.db import models

# Create your models here.

class Book(models.Model):
    CATEGORY_CHOICES = [
        ('fiction', '小说'),
        ('non-fiction', '非小说'),
        ('children', '儿童'),
        ('education', '教育'),
        ('other', '其他'),
    ]

    title = models.CharField(max_length=200, verbose_name='书名')
    author = models.CharField(max_length=100, verbose_name='作者')
    publisher = models.CharField(max_length=100, verbose_name='出版社')
    isbn = models.CharField(max_length=13, unique=True, verbose_name='ISBN')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name='类别')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='价格')
    stock = models.IntegerField(default=0, verbose_name='库存')
    description = models.TextField(blank=True, verbose_name='描述')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '图书'
        verbose_name_plural = '图书'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
