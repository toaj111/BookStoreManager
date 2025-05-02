from rest_framework import serializers
from .models import Book, Category, PurchaseOrder

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'publisher', 'isbn', 'category', 'category_name',
            'price', 'stock', 'status', 'status_display', 'description', 'cover',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_isbn(self, value):
        # 移除所有非数字字符
        isbn = ''.join(filter(str.isdigit, value))
        if len(isbn) != 13:
            raise serializers.ValidationError('ISBN必须是13位数字')
        return isbn

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('价格必须大于0')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('库存不能为负数')
        return value

class PurchaseOrderSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'book', 'book_title', 'book_isbn', 'purchase_price', 'quantity',
            'status', 'status_display', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("数量必须大于0")
        return value

    def validate_purchase_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("进货价格必须大于0")
        return value

class NewBookPurchaseOrderSerializer(serializers.Serializer):
    isbn = serializers.CharField(max_length=13)
    title = serializers.CharField(max_length=200)
    author = serializers.CharField(max_length=100)
    publisher = serializers.CharField(max_length=100)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    description = serializers.CharField(required=False, allow_blank=True)
    purchase_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField()

    def validate_isbn(self, value):
        if not value.isdigit() or len(value) != 13:
            raise serializers.ValidationError("ISBN必须是13位数字")
        if Book.objects.filter(isbn=value).exists():
            raise serializers.ValidationError("该ISBN的图书已存在，请直接使用图书ID创建进货订单")
        return value 