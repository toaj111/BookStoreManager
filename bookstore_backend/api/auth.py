from django.contrib.auth.backends import ModelBackend
from .models import User
import logging

logger = logging.getLogger(__name__)

class MD5Backend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                # 确保用户有正确的角色和权限
                if not user.role:
                    user.role = 'admin' if user.is_superuser else 'staff'
                    user.save()
                logger.info(f"User {username} authenticated successfully")
                return user
            else:
                logger.warning(f"Password check failed for user {username}")
        except User.DoesNotExist:
            logger.warning(f"User {username} does not exist")
            return None
        return None 