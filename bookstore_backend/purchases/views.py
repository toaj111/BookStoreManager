from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Purchase
from .serializers import PurchaseSerializer
from financials.models import Financial
from books.models import Book

# Create your views here.

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        purchase = serializer.save(created_by=self.request.user)
        
        # 创建财务记录
        total_amount = purchase.quantity * purchase.purchase_price
        Financial.objects.create(
            type='expense',
            category='purchase',
            amount=total_amount,
            description=f'进货图书 {purchase.book.title} {purchase.quantity} 本',
            operator=self.request.user
        )

        # 更新图书库存
        book = purchase.book
        book.stock += purchase.quantity
        if book.status == 'out_of_stock' and book.stock > 0:
            book.status = 'in_stock'
        book.save()
