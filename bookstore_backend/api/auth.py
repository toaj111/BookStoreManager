from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.hashers import check_password
from .models import User

class MD5Backend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(username=username)
            if check_password(password, user.password):
                return user
        except User.DoesNotExist:
            return None
        return None 