from django.db import models
from books.models import Book
from accounts.models import User

class Purchase(models.Model):
    book = models.ForeignKey(Book, on_delete=models.PROTECT, verbose_name='图书')
    quantity = models.IntegerField(verbose_name='数量')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='单价')
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='总价')
    supplier = models.CharField(max_length=100, verbose_name='供应商')
    purchaser = models.ForeignKey(User, on_delete=models.PROTECT, verbose_name='采购员')
    purchase_date = models.DateTimeField(auto_now_add=True, verbose_name='采购日期')
    notes = models.TextField(blank=True, verbose_name='备注')

    class Meta:
        verbose_name = '采购记录'
        verbose_name_plural = '采购记录'
        ordering = ['-purchase_date']

    def __str__(self):
        return f"{self.book.title} - {self.quantity}本 - {self.total}元"

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.price
        super().save(*args, **kwargs)
