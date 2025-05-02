import os
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore_backend.settings')
django.setup()

from api.models import User

def create_test_user():
    try:
        # 检查用户是否已存在
        if not User.objects.filter(username='testuser').exists():
            user = User.objects.create_user(
                username='testuser',
                password='testpass123',
                email='test@example.com',
                first_name='Test',
                last_name='User',
                role='admin',
                employee_id='EMP001'
            )
            print(f"测试用户创建成功！用户名: testuser, 密码: testpass123")
        else:
            print("测试用户已存在！")
    except Exception as e:
        print(f"创建用户时出错: {str(e)}")

if __name__ == '__main__':
    create_test_user() 