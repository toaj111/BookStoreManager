# 图书销售管理系统

## 项目概述
本系统是一个完整的图书销售管理系统，实现图书库存、销售和财务的统一管理。系统支持超级管理员和普通管理员两种用户角色，并提供完整的图书进销存管理功能。

## 技术栈
- 前端：React.js
- 后端：Django + Django REST Framework
- 数据库：SQLite
- 认证：JWT (JSON Web Tokens)

## 项目结构
```
BookStoreManager/
├── bookstore_backend/     # Django后端
│   ├── accounts/         # 用户账户管理
│   ├── books/           # 图书管理
│   ├── sales/          # 销售管理
│   ├── purchases/      # 进货管理
│   ├── financials/     # 财务管理
│   └── manage.py       # Django管理脚本
└── bookstore_frontend/  # React前端
    ├── public/         # 静态资源
    └── src/           # React源码
```

## 环境配置步骤

### 1. 配置Python环境
```bash
# 安装虚拟环境工具(可选但推荐)
pip install virtualenv
virtualenv venv
source venv/bin/activate  # 在Windows上使用: venv\Scripts\activate

# 安装Python依赖
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

### 2. 配置后端
```bash
cd bookstore_backend

# 应用数据库迁移
python manage.py makemigrations
python manage.py migrate

# 创建超级管理员用户
python manage.py shell
```

在Python shell中执行:
```python
from accounts.models import User
User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123',
    employee_id='ADMIN001',
    role='super_admin'
)
exit()
```

### 3. 配置前端
```bash
cd bookstore_frontend
npm install
```

## 启动开发服务器

### 启动后端服务器
```bash
cd bookstore_backend
python manage.py runserver
```
后端服务器将在 http://localhost:8000 运行

### 启动前端开发服务器
```bash
cd bookstore_frontend
npm start
```
前端开发服务器将在 http://localhost:3000 运行

## 默认超级管理员账号
- 用户名: admin
- 密码: admin123
- 员工编号: ADMIN001

## 主要功能模块

### 1. 用户管理
- 超级管理员和普通管理员两种角色
- 用户信息管理
- JWT认证

### 2. 图书库存管理
- 图书信息维护(ISBN、书名、作者、出版社等)
- 库存数量跟踪
- 图书信息修改

### 3. 进货管理
- 创建进货订单
- 订单状态跟踪
- 进货付款管理

### 4. 销售管理
- 图书销售记录
- 销售统计
- 退货处理

### 5. 财务管理
- 收支记录
- 财务报表
- 账单查询

### 6. 图书管理
图书管理模块允许用户添加、编辑和删除图书信息。用户可以查看图书列表，并通过表单添加新图书或编辑现有图书信息。

#### 功能
- **查看图书列表**：显示所有图书的详细信息，包括书名、作者、出版社、ISBN、价格和库存。
- **添加图书**：通过表单添加新图书信息。
- **编辑图书**：修改现有图书的信息。
- **删除图书**：从系统中删除图书信息。

## 开发注意事项
1. API访问需要JWT认证
2. 前端API请求已配置CORS，支持跨域访问
3. 使用SQLite数据库，无需额外配置

## 数据库配置说明
数据库配置在 `bookstore_backend/bookstore_backend/settings.py` 中：
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## 常见问题解决
1. 如果遇到跨域问题，检查CORS配置是否正确
2. 如果遇到认证问题，检查JWT token是否正确
3. 如果遇到数据库问题，确保已执行数据库迁移
