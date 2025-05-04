# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from django.contrib.auth.password_validation import validate_password

# User = get_user_model()

# class UserSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True)
#     confirm_password = serializers.CharField(write_only=True, required=True)

#     class Meta:
#         model = User
#         fields = [
#             'id',
#             'username',
#             'email',
#             'first_name',
#             'last_name',
#             'role',
#             'gender',
#             'phone',
#             'address',
#             'department',
#             'position',
#             'is_active',
#             'is_staff',
#             'is_superuser',
#             'date_joined',
#             'last_login',
#             'created_at',
#             'updated_at',
#             'password',
#             'confirm_password',
#         ]
#         read_only_fields = ['id', 'date_joined', 'last_login', 'created_at', 'updated_at']

#     def validate(self, data):
#         if self.context.get('request').method == 'POST':
#             errors = {}
#             if 'username' not in data:
#                 errors['username'] = ['用户名不能为空']
#             if 'email' not in data:
#                 errors['email'] = ['邮箱不能为空']
#             if 'first_name' not in data:
#                 errors['first_name'] = ['名字不能为空']
#             if 'last_name' not in data:
#                 errors['last_name'] = ['姓氏不能为空']
#             if 'role' not in data:
#                 errors['role'] = ['角色不能为空']
#             if 'password' not in data:
#                 errors['password'] = ['密码不能为空']
#             if 'confirm_password' not in data:
#                 errors['confirm_password'] = ['请确认密码']
#             elif data['password'] != data['confirm_password']:
#                 errors['confirm_password'] = ['两次输入的密码不一致']
#             elif len(data['password']) < 8:
#                 errors['password'] = ['密码至少需要8个字符']
#             elif not any(c.isalpha() for c in data['password']):
#                 errors['password'] = ['密码必须包含字母']
#             elif not any(c.isdigit() for c in data['password']):
#                 errors['password'] = ['密码必须包含数字']
            
#             if errors:
#                 raise serializers.ValidationError(errors)
#         return data

#     def create(self, validated_data):
#         password = validated_data.pop('password', None)
#         validated_data.pop('confirm_password', None)
#         user = super().create(validated_data)
#         if password:
#             user.set_password(password)
#             user.save()
#         return user

#     def update(self, instance, validated_data):
#         password = validated_data.pop('password', None)
#         validated_data.pop('confirm_password', None)
#         user = super().update(instance, validated_data)
#         if password:
#             user.set_password(password)
#             user.save()
#         return user 
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'gender',
            'phone', 'address', 'department', 'position', 'is_active', 'is_staff',
            'is_superuser', 'date_joined', 'last_login', 'password', 'confirm_password'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'date_joined', 'last_login']

    def validate(self, data):
        # 创建用户时
        if self.instance is None:
            if not data.get('password'):
                raise serializers.ValidationError({'password': 'This field is required.'})
            if not data.get('confirm_password'):
                raise serializers.ValidationError({'confirm_password': 'This field is required.'})
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        else:
            # 更新用户时，只有填写密码才校验
            if data.get('password') or data.get('confirm_password'):
                if not data.get('password'):
                    raise serializers.ValidationError({'password': 'This field is required if you want to change password.'})
                if not data.get('confirm_password'):
                    raise serializers.ValidationError({'confirm_password': 'This field is required if you want to change password.'})
                if data.get('password') != data.get('confirm_password'):
                    raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('confirm_password', None)
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('confirm_password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user