# 图书销售管理系统

## 项目概述
本系统是一个完整的图书销售管理系统，实现图书库存、销售和财务的统一管理。系统支持超级管理员和普通管理员两种用户角色，并提供完整的图书进销存管理功能。

## 技术栈
- 前端：React.js
- 后端：Django + Django REST Framework
- 数据库：PostgreSQL
- 认证：JWT (JSON Web Tokens)

## 项目结构
```
BookStoreManager/
├── bookstore_backend/     # Django后端
│   ├── api/              # REST API应用
│   │   ├── models.py     # 数据模型
│   │   ├── views.py      # API视图
│   │   └── urls.py       # API路由
│   └── manage.py         # Django管理脚本
└── bookstore_frontend/    # React前端
    ├── public/           # 静态资源
    └── src/             # React源码
```

## 环境配置步骤

### 1. 安装必要的系统包
```bash
# 更新系统包
sudo apt-get update

# 安装PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 安装Python包管理器和开发工具
sudo apt-get install -y python3-pip python3-dev
```

### 2. 配置PostgreSQL数据库
```bash
# 启动PostgreSQL服务
sudo service postgresql start

# 创建数据库和用户
sudo -u postgres psql -c "CREATE USER bookstore_user WITH PASSWORD 'bookstore_password';"
sudo -u postgres psql -c "CREATE DATABASE bookstore OWNER bookstore_user;"
```

### 3. 配置Python环境
```bash
# 安装虚拟环境工具(可选但推荐)
pip install virtualenv
virtualenv venv
source venv/bin/activate  # 在Windows上使用: venv\Scripts\activate

# 安装Python依赖
pip install django djangorestframework psycopg2-binary djangorestframework-simplejwt
```

### 4. 配置后端
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
from api.models import User
User.objects.create_superuser(
    username='admin',
    email='admin@example.com',
    password='admin123',
    employee_id='ADMIN001',
    role='super_admin'
)
exit()
```

### 5. 配置前端
```bash
# 安装Node.js (如果还没安装)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc  # 或 ~/.zshrc
nvm install node  # 安装最新版Node.js

# 安装前端依赖
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
- MD5密码加密存储

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

## 开发注意事项
1. 请确保PostgreSQL服务已启动
2. 所有密码都会自动使用MD5加密存储
3. API访问需要JWT认证
4. 请根据实际情况修改数据库连接配置(settings.py中的DATABASE配置)

## 数据库配置说明
数据库配置在 `bookstore_backend/bookstore_backend/settings.py` 中：
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bookstore',
        'USER': 'bookstore_user',
        'PASSWORD': 'bookstore_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 常见问题解决
1. 如果遇到数据库连接问题，请检查PostgreSQL服务是否正常运行
2. 如果遇到权限问题，请检查数据库用户权限设置
3. 前端API请求跨域问题已通过CORS设置解决
