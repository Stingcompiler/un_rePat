from django.db import models
from django.conf import settings


class Department(models.Model):
    """Academic department."""
    name_ar = models.CharField(max_length=200, verbose_name='اسم القسم بالعربية')
    name_en = models.CharField(max_length=200, blank=True, verbose_name='Department Name')
    description_ar = models.TextField(verbose_name='الوصف بالعربية')
    description_en = models.TextField(blank=True, verbose_name='Description')
    image = models.ImageField(upload_to='departments/', blank=True, null=True, verbose_name='صورة القسم')
    supervisor = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='supervised_department',
        limit_choices_to={'role': 'supervisor'},
        verbose_name='المشرف'
    )
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'قسم'
        verbose_name_plural = 'الأقسام'
        ordering = ['name_ar']
    
    def __str__(self):
        return self.name_ar


class AcademicYear(models.Model):
    """Academic year configuration."""
    year = models.PositiveIntegerField(unique=True, verbose_name='السنة')
    name_ar = models.CharField(max_length=100, verbose_name='الاسم بالعربية')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='Name')
    is_current = models.BooleanField(default=False, verbose_name='السنة الحالية')
    
    class Meta:
        verbose_name = 'سنة دراسية'
        verbose_name_plural = 'السنوات الدراسية'
        ordering = ['-year']
    
    def __str__(self):
        return self.name_ar
    
    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicYear.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class Course(models.Model):
    """Academic course."""
    code = models.CharField(max_length=20, unique=True, verbose_name='رمز المادة')
    name_ar = models.CharField(max_length=200, verbose_name='اسم المادة بالعربية')
    name_en = models.CharField(max_length=200, blank=True, verbose_name='Course Name')
    description_ar = models.TextField(blank=True, verbose_name='الوصف بالعربية')
    description_en = models.TextField(blank=True, verbose_name='Description')
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='courses',
        verbose_name='القسم'
    )
    academic_year = models.PositiveIntegerField(verbose_name='السنة الدراسية')
    semester = models.PositiveIntegerField(
        choices=[(i, f'المستوى {i}') for i in range(1, 11)],
        default=1,
        verbose_name='الفصل الدراسي (المستوى)'
    )
    credits = models.PositiveIntegerField(default=3, verbose_name='الساعات المعتمدة')
    has_lab = models.BooleanField(default=False, verbose_name='يحتوي على معمل')
    is_deleted = models.BooleanField(default=False, verbose_name='محذوف')  # Soft delete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'مادة'
        verbose_name_plural = 'المواد'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name_ar}"
    
    def delete(self, *args, **kwargs):
        """Soft delete instead of hard delete."""
        self.is_deleted = True
        self.save()


class CourseInstructorRole(models.TextChoices):
    TEACHER = 'teacher', 'أستاذ'
    TA = 'ta', 'معيد'


class CourseInstructor(models.Model):
    """Assign teachers and TAs to courses."""
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='instructors',
        verbose_name='المادة'
    )
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teaching_assignments',
        verbose_name='المدرس'
    )
    role = models.CharField(
        max_length=10,
        choices=CourseInstructorRole.choices,
        verbose_name='الدور'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'تعيين مدرس'
        verbose_name_plural = 'تعيينات المدرسين'
        unique_together = ['course', 'instructor']
        ordering = ['course', 'role']
    
    def __str__(self):
        return f"{self.instructor.full_name_ar} - {self.course.name_ar} ({self.get_role_display()})"
