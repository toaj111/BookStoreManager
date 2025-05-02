from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'gender',
            'phone',
            'hire_date',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'username', 'date_joined'] 