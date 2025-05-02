from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import models
from .models import User, Book, PurchaseOrder, Sale, FinancialTransaction
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    BookSerializer, PurchaseOrderSerializer,
    SaleSerializer, FinancialTransactionSerializer
)

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['login', 'create']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    # 自定义api路由

    # 登录
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 获取当前用户信息
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    # 登出
    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Book.objects.all()

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        book = self.get_object()
        quantity = request.data.get('quantity', 0)
        book.stock_quantity += int(quantity)
        book.save()
        return Response({'status': 'stock updated'})

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.status == 'paid':
            return Response({'error': '订单已支付'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 更新订单状态
        order.status = 'paid'
        order.save()
        
        # 更新图书库存
        book = order.book
        book.stock_quantity += order.quantity
        book.save()
        
        # 创建支出记录
        FinancialTransaction.objects.create(
            transaction_type='expense',
            amount=order.total_amount,
            description=f'支付进货订单 {order.order_number}',
            related_order=order,
            created_by=request.user
        )
        
        return Response({'status': 'order paid and stock updated'})

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        sale = serializer.save()
        # 更新库存
        book = sale.book
        book.stock_quantity -= sale.quantity
        book.save()
        
        # 创建收入记录
        FinancialTransaction.objects.create(
            transaction_type='income',
            amount=sale.total_amount,
            description=f'销售收入 {sale.sale_number}',
            related_sale=sale,
            created_by=self.request.user
        )

    @action(detail=True, methods=['post'])
    def process_return(self, request, pk=None):
        sale = self.get_object()
        if sale.status == 'returned':
            return Response({'error': '该销售记录已退货'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 更新销售状态
        sale.status = 'returned'
        sale.save()
        
        # 恢复库存
        book = sale.book
        book.stock_quantity += sale.quantity
        book.save()
        
        # 创建支出记录（退款）
        FinancialTransaction.objects.create(
            transaction_type='expense',
            amount=sale.total_amount,
            description=f'退货退款 {sale.sale_number}',
            related_sale=sale,
            created_by=request.user
        )
        
        return Response({'status': 'sale returned and stock restored'})

class FinancialTransactionViewSet(viewsets.ModelViewSet):
    queryset = FinancialTransaction.objects.all()
    serializer_class = FinancialTransactionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_income = self.queryset.filter(transaction_type='income').aggregate(total=models.Sum('amount'))['total'] or 0
        total_expense = self.queryset.filter(transaction_type='expense').aggregate(total=models.Sum('amount'))['total'] or 0
        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'net_balance': total_income - total_expense
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': '请提供用户名和密码'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)
        return Response({
            'message': '登录成功',
            'user': serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    else:
        return Response({
            'error': '用户名或密码错误'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({
        'message': '已成功退出登录'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': '注册成功',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
