from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'purchases', views.PurchaseOrderViewSet)
router.register(r'sales', views.SaleViewSet)
router.register(r'financial', views.FinancialTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/user/', views.get_user_info, name='user-info'),
    path('auth/register/', views.register_view, name='register'),
] 