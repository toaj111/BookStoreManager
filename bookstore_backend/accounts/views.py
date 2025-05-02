from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserSerializer
from .permissions import IsAdminOrSelf, IsAdminUser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSelf]

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        if self.action == 'login':
            return [AllowAny()]
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)  # 添加调试日志
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)  # 添加调试日志
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': '请提供用户名和密码'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            serializer = self.get_serializer(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': serializer.data
            })
        else:
            return Response(
                {'error': '用户名或密码错误'},
                status=status.HTTP_401_UNAUTHORIZED
            )

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_me(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roles(self, request):
        return Response({
            'roles': [
                {'value': 'admin', 'label': '管理员'},
                {'value': 'manager', 'label': '经理'},
                {'value': 'staff', 'label': '员工'},
            ]
        })

    @action(detail=False, methods=['get'])
    def permissions(self, request):
        return Response({
            'permissions': [
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
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'status': 'user activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'user deactivated'})

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('new_password')
        if not new_password:
            return Response(
                {'error': '新密码不能为空'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        return Response({'status': 'password reset'})
