from django.contrib import admin
from .models import Financial

@admin.register(Financial)
class FinancialAdmin(admin.ModelAdmin):
    list_display = ('type', 'category', 'amount', 'operator', 'created_at')
    list_filter = ('type', 'category', 'created_at')
    search_fields = ('description', 'operator__username')
    readonly_fields = ('created_at', 'updated_at')
