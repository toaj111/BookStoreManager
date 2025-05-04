from rest_framework import serializers
from .models import Financial
from accounts.models import User
from accounts.serializers import UserSerializer
from django.contrib.contenttypes.models import ContentType

class FinancialSerializer(serializers.ModelSerializer):
    operator = UserSerializer(read_only=True)
    operator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='operator',
        write_only=True
    )
    content_type = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Financial
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at'] 