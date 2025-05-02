from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Book, PurchaseOrder, Sale, FinancialTransaction

# 序列化器：将数据库中的数据转换为JSON格式
# 反序列化器：将JSON格式转换为数据库中的数据

# User实例与json数据的转化
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'employee_id', 'role']
        read_only_fields = ['id']

# 用于注册用户
class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'employee_id', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# 用于登录
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = User.objects.filter(username=data['username']).first()
        if user and user.check_password(data['password']):
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