from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', '管理员'),
        ('manager', '经理'),
        ('staff', '员工'),
    ]

    GENDER_CHOICES = [
        ('M', '男'),
        ('F', '女'),
    ]

    role = models.CharField(_('角色'), max_length=10, choices=ROLE_CHOICES, default='staff')
    gender = models.CharField(_('性别'), max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    phone = models.CharField(_('手机号'), max_length=15, blank=True)
    address = models.TextField(_('地址'), blank=True)
    department = models.CharField(_('部门'), max_length=50, blank=True, null=True)
    position = models.CharField(_('职位'), max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    objects = CustomUserManager()

    class Meta:
        verbose_name = _('用户')
        verbose_name_plural = _('用户')
        ordering = ['username']

    def __str__(self):
        return self.username

    def get_full_name(self):
        return f"{self.last_name}{self.first_name}" if self.last_name and self.first_name else self.username

    def has_role(self, role):
        return self.role == role

    def is_admin(self):
        return self.role == 'admin'

    def is_manager(self):
        return self.role == 'manager'

    def save(self, *args, **kwargs):
        if self.is_superuser or self.role == 'admin':
            self.role = 'admin'
            self.is_staff = True
        super().save(*args, **kwargs)

    def set_password(self, raw_password):
        super().set_password(raw_password)
        self.save()
