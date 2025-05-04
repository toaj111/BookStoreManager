from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.contrib.contenttypes.models import ContentType
from .models import Financial
from .serializers import FinancialSerializer
from books.models import Book
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class FinancialViewSet(viewsets.ModelViewSet):
    queryset = Financial.objects.all()
    serializer_class = FinancialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request):
        logger.info('Listing financial records')
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f'Found {len(queryset)} financial records')
        return Response(serializer.data)

    def perform_create(self, serializer):
        logger.info('Creating financial record')
        financial = serializer.save(operator=self.request.user)
        logger.info(f'Created financial record: {financial.id}')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        logger.info('Getting financial summary')
        # 计算总收入
        total_income = Financial.objects.filter(type='income').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # 计算总支出
        total_expense = Financial.objects.filter(type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # 计算净余额
        net_balance = total_income - total_expense

        # 计算交易笔数
        transaction_count = Financial.objects.count()

        # 计算总图书数
        total_books = Book.objects.aggregate(
            total=Sum('stock')
        )['total'] or 0

        data = {
            'total_income': total_income,
            'total_expense': total_expense,
            'net_balance': net_balance,
            'transaction_count': transaction_count,
            'total_books': total_books
        }
        logger.info(f'Summary data: {data}')
        return Response(data)

    def get_queryset(self):
        queryset = Financial.objects.all()
        # 按创建时间降序排序
        return queryset.order_by('-created_at')
