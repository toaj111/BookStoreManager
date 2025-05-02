from rest_framework import permissions

class IsAdminOrSelf(permissions.BasePermission):
    def has_permission(self, request, view):
        # 允许所有用户查看自己的信息
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 允许管理员访问所有功能
        if request.user.is_staff:
            return True
            
        return True

    def has_object_permission(self, request, view, obj):
        # 允许所有用户查看自己的信息
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 允许管理员修改任何用户的信息
        if request.user.is_staff:
            return True
            
        # 允许用户修改自己的信息
        return obj == request.user

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.role == 'manager')

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj == request.user 