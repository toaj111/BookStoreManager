from rest_framework import serializers
from .models import Purchase
from books.models import Book
from accounts.models import User
from books.serializers import BookSerializer
from accounts.serializers import UserSerializer

class PurchaseSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    purchaser = UserSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), source='book', write_only=True)
    purchaser_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='purchaser', write_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ['total', 'purchase_date'] 