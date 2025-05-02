from rest_framework import serializers
from .models import Sale
from books.models import Book
from accounts.models import User
from books.serializers import BookSerializer
from accounts.serializers import UserSerializer

class SaleSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), source='book', write_only=True)
    seller_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='seller', write_only=True)

    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['total', 'sale_date'] 