from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .permissions import IsAdminOrSelf

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roles(self, request):
        roles = [
            {'value': 'admin', 'label': '管理员'},
            {'value': 'manager', 'label': '经理'},
            {'value': 'staff', 'label': '普通员工'},
        ]
        return Response({'roles': roles})

    @action(detail=False, methods=['get'])
    def permissions(self, request):
        permissions = [
            {'value': 'view_book', 'label': '查看图书'},
            {'value': 'add_book', 'label': '添加图书'},
            {'value': 'change_book', 'label': '修改图书'},
            {'value': 'delete_book', 'label': '删除图书'},
            {'value': 'view_sale', 'label': '查看销售'},
            {'value': 'add_sale', 'label': '添加销售'},
            {'value': 'change_sale', 'label': '修改销售'},
            {'value': 'delete_sale', 'label': '删除销售'},
            {'value': 'view_purchase', 'label': '查看采购'},
            {'value': 'add_purchase', 'label': '添加采购'},
            {'value': 'change_purchase', 'label': '修改采购'},
            {'value': 'delete_purchase', 'label': '删除采购'},
            {'value': 'view_financial', 'label': '查看财务'},
            {'value': 'add_financial', 'label': '添加财务'},
            {'value': 'change_financial', 'label': '修改财务'},
            {'value': 'delete_financial', 'label': '删除财务'},
            {'value': 'view_user', 'label': '查看用户'},
            {'value': 'add_user', 'label': '添加用户'},
            {'value': 'change_user', 'label': '修改用户'},
            {'value': 'delete_user', 'label': '删除用户'},
        ]
        return Response({'permissions': permissions}) 