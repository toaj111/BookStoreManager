from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from .models import Financial
from .serializers import FinancialSerializer

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

    @action(detail=False, methods=['get'])
    def summary(self, request):
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

        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'net_balance': net_balance,
            'transaction_count': transaction_count
        })
