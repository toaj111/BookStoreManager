from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Sale
from .serializers import SaleSerializer
from financials.models import Financial
from books.models import Book

# Create your views here.

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def create_batch(self, request):
        items = request.data.get('items', [])
        if not items:
            return Response(
                {'error': '销售项目不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )

        sales = []
        total_amount = 0
        for item in items:
            try:
                book = Book.objects.get(id=item['book_id'])
                if book.status != 'in_stock':
                    return Response(
                        {'error': f'图书 {book.title} 不在销售状态'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if book.stock < item['quantity']:
                    return Response(
                        {'error': f'图书 {book.title} 库存不足'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # 创建销售记录
                sale = Sale.objects.create(
                    book=book,
                    quantity=item['quantity'],
                    sale_price=book.price,
                    created_by=request.user
                )
                sales.append(sale)
                total_amount += book.price * item['quantity']

                # 更新库存
                book.stock -= item['quantity']
                if book.stock == 0:
                    book.status = 'out_of_stock'
                book.save()

            except Book.DoesNotExist:
                return Response(
                    {'error': f'图书ID {item["book_id"]} 不存在'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 创建财务记录
        Financial.objects.create(
            type='income',
            category='sale',
            amount=total_amount,
            description=f'销售图书 {len(sales)} 本',
            operator=request.user
        )

        return Response(
            SaleSerializer(sales, many=True).data,
            status=status.HTTP_201_CREATED
        )
