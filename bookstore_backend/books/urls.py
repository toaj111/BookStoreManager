from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CategoryViewSet, PurchaseOrderViewSet, SaleViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'sales', SaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 