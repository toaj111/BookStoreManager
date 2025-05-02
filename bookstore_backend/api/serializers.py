from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import Permission
from .models import User, Book, PurchaseOrder, Sale, FinancialTransaction

# 序列化器：将数据库中的数据转换为JSON格式
# 反序列化器：将JSON格式转换为数据库中的数据

# User实例与json数据的转化
class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['codename', 'name']

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'gender', 'phone', 'hire_date',
            'is_active', 'is_staff', 'permissions'
        ]
        read_only_fields = ['id', 'permissions']
    
    def get_permissions(self, obj):
        permissions = obj.get_role_permissions()
        return [p.codename for p in permissions]
    
    def validate_role(self, value):
        request = self.context.get('request')
        if request and request.user:
            if not request.user.is_superuser and request.user.role != 'admin':
                raise serializers.ValidationError("只有管理员可以修改用户角色")
        return value

# 用于注册用户
class UserCreateSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

# 用于登录
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user:
            data['user'] = user
            return data
        raise serializers.ValidationError("用户名或密码错误")

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'isbn', 'title', 'author', 'publisher', 
                 'price', 'stock_quantity', 'description', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ('created_by', 'order_number', 'total_amount')

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("采购数量必须大于0")
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("单价必须大于0")
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SaleSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('created_by', 'sale_number', 'total_amount')

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("销售数量必须大于0")
        return value

    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("销售单价必须大于0")
        return value

    def validate(self, data):
        # 检查库存是否足够
        book = data['book']
        quantity = data['quantity']
        if book.stock_quantity < quantity:
            raise serializers.ValidationError(f"库存不足，当前库存: {book.stock_quantity}")
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class FinancialTransactionSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = FinancialTransaction
        fields = ['id', 'transaction_number', 'transaction_type', 'amount', 
                 'description', 'related_order', 'related_sale', 'created_by', 
                 'created_by_username', 'created_at', 'updated_at']
        read_only_fields = ['id', 'transaction_number', 'created_at', 'updated_at'] 