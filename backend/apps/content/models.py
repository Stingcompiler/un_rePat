from django.db import models
from django.conf import settings


class LectureType(models.TextChoices):
    THEORY = 'theory', 'نظري'
    LAB = 'lab', 'عملي'


class Lecture(models.Model):
    """Course lecture content."""
    course = models.ForeignKey(
        'academic.Course',
        on_delete=models.CASCADE,
        related_name='lectures',
        verbose_name='المادة'
    )
    title_ar = models.CharField(max_length=300, verbose_name='العنوان بالعربية')
    title_en = models.CharField(max_length=300, blank=True, verbose_name='Title')
    content = models.TextField(verbose_name='المحتوى')
    lecture_type = models.CharField(
        max_length=10,
        choices=LectureType.choices,
        verbose_name='نوع المحاضرة'
    )
    file = models.FileField(
        upload_to='lectures/',
        blank=True,
        null=True,
        verbose_name='ملف مرفق'
    )
    order = models.PositiveIntegerField(default=1, verbose_name='الترتيب')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_lectures',
        verbose_name='أنشئ بواسطة'
    )
    is_published = models.BooleanField(default=False, verbose_name='منشور')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'محاضرة'
        verbose_name_plural = 'المحاضرات'
        ordering = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.code} - {self.title_ar}"


class Assignment(models.Model):
    """Course assignment."""
    course = models.ForeignKey(
        'academic.Course',
        on_delete=models.CASCADE,
        related_name='assignments',
        verbose_name='المادة'
    )
    title_ar = models.CharField(max_length=300, verbose_name='العنوان بالعربية')
    title_en = models.CharField(max_length=300, blank=True, verbose_name='Title')
    description = models.TextField(verbose_name='الوصف')
    assignment_type = models.CharField(
        max_length=10,
        choices=LectureType.choices,
        verbose_name='نوع الواجب'
    )
    file = models.FileField(
        upload_to='assignments/',
        blank=True,
        null=True,
        verbose_name='ملف مرفق'
    )
    max_score = models.PositiveIntegerField(default=100, verbose_name='الدرجة الكاملة')
    due_date = models.DateTimeField(verbose_name='تاريخ التسليم')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_assignments',
        verbose_name='أنشئ بواسطة'
    )
    is_published = models.BooleanField(default=False, verbose_name='منشور')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'واجب'
        verbose_name_plural = 'الواجبات'
        ordering = ['-due_date']
    
    def __str__(self):
        return f"{self.course.code} - {self.title_ar}"
