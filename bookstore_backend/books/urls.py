from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CategoryViewSet, PurchaseOrderViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'purchase-orders', PurchaseOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 