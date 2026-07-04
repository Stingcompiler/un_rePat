from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    SYSTEM_MANAGER = 'system_manager', 'مدير النظام'
    SUPERVISOR = 'supervisor', 'المشرف'
    TEACHER = 'teacher', 'الأستاذ'
    TEACHING_ASSISTANT = 'ta', 'المعيد'
    STUDENT = 'student', 'الطالب'


class User(AbstractUser):
    """Custom User model with role-based access control."""
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT,
        verbose_name='الدور'
    )
    full_name_ar = models.CharField(max_length=200, verbose_name='الاسم الكامل بالعربية')
    full_name_en = models.CharField(max_length=200, blank=True, verbose_name='Full Name in English')
    phone = models.CharField(max_length=20, blank=True, verbose_name='رقم الهاتف')
    
    # For students only
    department = models.ForeignKey(
        'academic.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        verbose_name='القسم'
    )
    academic_year = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='السنة الدراسية'
    )
    university_number = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name='الرقم الجامعي'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمين'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name_ar} ({self.get_role_display()})"
    
    @property
    def is_system_manager(self):
        return self.role == UserRole.SYSTEM_MANAGER
    
    @property
    def is_supervisor(self):
        return self.role == UserRole.SUPERVISOR
    
    @property
    def is_teacher(self):
        return self.role == UserRole.TEACHER
    
    @property
    def is_ta(self):
        return self.role == UserRole.TEACHING_ASSISTANT
    
    @property
    def is_student_role(self):
        return self.role == UserRole.STUDENT


class UniversityStudent(models.Model):
    """
    Registry of all students admitted to the university.
    Used to validate student registration.
    """
    university_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='الرقم الجامعي'
    )
    full_name_ar = models.CharField(max_length=200, verbose_name='الاسم بالعربية')
    full_name_en = models.CharField(max_length=200, blank=True, verbose_name='Name in English')
    department = models.ForeignKey(
        'academic.Department',
        on_delete=models.CASCADE,
        related_name='university_students',
        verbose_name='القسم'
    )
    academic_year = models.PositiveIntegerField(verbose_name='السنة الدراسية')
    is_registered = models.BooleanField(default=False, verbose_name='مسجل في النظام')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'طالب جامعي'
        verbose_name_plural = 'الطلاب الجامعيين'
        ordering = ['university_number']
    
    def __str__(self):
        return f"{self.university_number} - {self.full_name_ar}"
