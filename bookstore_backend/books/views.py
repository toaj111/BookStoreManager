from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book, Category, PurchaseOrder
from .serializers import (
    BookSerializer, CategorySerializer,
    PurchaseOrderSerializer, NewBookPurchaseOrderSerializer
)
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminOrReadOnly
from django.db import models

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Book.objects.all()
        category = self.request.query_params.get('category', None)
        status = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)

        if category:
            queryset = queryset.filter(category_id=category)
        if status:
            queryset = queryset.filter(status=status)
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(author__icontains=search) |
                models.Q(publisher__icontains=search) |
                models.Q(isbn__icontains=search)
            )
        return queryset

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        book = self.get_object()
        quantity = request.data.get('quantity', 0)
        
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {'error': '数量必须是整数'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity == 0:
            return Response(
                {'error': '数量不能为0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_stock = book.stock + quantity
        if new_stock < 0:
            return Response(
                {'error': '库存不能为负数'},
                status=status.HTTP_400_BAD_REQUEST
            )

        book.stock = new_stock
        if new_stock == 0:
            book.status = 'out_of_stock'
        else:
            book.status = 'in_stock'
        book.save()

        return Response({
            'message': '库存更新成功',
            'new_stock': book.stock,
            'status': book.status
        })

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        book = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(Book.STATUS_CHOICES):
            return Response(
                {'error': '无效的状态'},
                status=status.HTTP_400_BAD_REQUEST
            )

        book.status = new_status
        book.save()

        return Response({
            'message': '状态更新成功',
            'status': book.status
        })

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PurchaseOrder.objects.all()
        status = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)

        if status:
            queryset = queryset.filter(status=status)
        if search:
            queryset = queryset.filter(
                models.Q(book__title__icontains=search) |
                models.Q(book__author__icontains=search) |
                models.Q(book__publisher__icontains=search) |
                models.Q(book__isbn__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.status != 'pending':
            return Response(
                {'error': '只有未付款的订单才能进行付款'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'paid'
        order.save()

        # 更新图书库存
        book = order.book
        book.stock += order.quantity
        if book.stock > 0:
            book.status = 'in_stock'
        book.save()

        return Response({
            'message': '付款成功',
            'status': order.status
        })

    @action(detail=True, methods=['post'])
    def return_order(self, request, pk=None):
        order = self.get_object()
        if order.status != 'pending':
            return Response(
                {'error': '只有未付款的订单才能进行退货'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'returned'
        order.save()

        return Response({
            'message': '退货成功',
            'status': order.status
        })

    @action(detail=False, methods=['post'])
    def create_with_new_book(self, request):
        serializer = NewBookPurchaseOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # 创建新图书
        book_data = {
            'isbn': serializer.validated_data['isbn'],
            'title': serializer.validated_data['title'],
            'author': serializer.validated_data['author'],
            'publisher': serializer.validated_data['publisher'],
            'category': serializer.validated_data['category'],
            'description': serializer.validated_data.get('description', ''),
            'price': serializer.validated_data['purchase_price'] * 1.3,  # 设置销售价格为进货价格的1.3倍
            'stock': 0,
            'status': 'out_of_stock'
        }
        book = Book.objects.create(**book_data)

        # 创建进货订单
        order_data = {
            'book': book,
            'purchase_price': serializer.validated_data['purchase_price'],
            'quantity': serializer.validated_data['quantity'],
            'created_by': request.user
        }
        order = PurchaseOrder.objects.create(**order_data)

        return Response(
            PurchaseOrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )
