from django.db import models
from accounts.models import User

class Financial(models.Model):
    TYPE_CHOICES = [
        ('income', '收入'),
        ('expense', '支出'),
    ]

    CATEGORY_CHOICES = [
        ('sale', '销售'),
        ('purchase', '采购'),
        ('salary', '工资'),
        ('rent', '租金'),
        ('utility', '水电'),
        ('other', '其他'),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES, verbose_name='类型')
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, verbose_name='类别')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='金额')
    description = models.TextField(blank=True, verbose_name='描述')
    operator = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='操作员')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        app_label = 'financials'
        verbose_name = '财务记录'
        verbose_name_plural = '财务记录'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.get_category_display()} - {self.amount}元"
