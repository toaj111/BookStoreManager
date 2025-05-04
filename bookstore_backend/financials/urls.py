from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinancialViewSet

router = DefaultRouter()
router.register('financials', FinancialViewSet, basename='financial')

urlpatterns = [
    path('', include(router.urls)),
] 