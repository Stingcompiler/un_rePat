from django.db import models
from django.conf import settings


class Submission(models.Model):
    """Student assignment submission."""
    assignment = models.ForeignKey(
        'content.Assignment',
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='الواجب'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions',
        verbose_name='الطالب'
    )
    file = models.FileField(upload_to='submissions/', verbose_name='الملف')
    notes = models.TextField(blank=True, verbose_name='ملاحظات الطالب')
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ التسليم')
    
    # Grading
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='الدرجة'
    )
    feedback = models.TextField(blank=True, verbose_name='ملاحظات المصحح')
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions',
        verbose_name='تم التصحيح بواسطة'
    )
    graded_at = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ التصحيح')
    
    class Meta:
        verbose_name = 'تسليم'
        verbose_name_plural = 'التسليمات'
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.student.full_name_ar} - {self.assignment.title_ar}"
    
    @property
    def is_graded(self):
        return self.score is not None


class CourseResult(models.Model):
    """Final course result for a student."""
    course = models.ForeignKey(
        'academic.Course',
        on_delete=models.CASCADE,
        related_name='results',
        verbose_name='المادة'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='course_results',
        verbose_name='الطالب'
    )
    final_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name='الدرجة النهائية'
    )
    grade = models.CharField(max_length=5, verbose_name='التقدير')
    notes = models.TextField(blank=True, verbose_name='ملاحظات')
    is_published = models.BooleanField(default=False, verbose_name='منشور')
    published_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='published_results',
        verbose_name='نشر بواسطة'
    )
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ النشر')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'نتيجة مادة'
        verbose_name_plural = 'نتائج المواد'
        unique_together = ['course', 'student']
        ordering = ['course', 'student']
    
    def __str__(self):
        return f"{self.student.full_name_ar} - {self.course.name_ar}: {self.grade}"
    
    @staticmethod
    def calculate_grade(score):
        """Calculate letter grade from score."""
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 80:
            return 'B+'
        elif score >= 75:
            return 'B'
        elif score >= 70:
            return 'C+'
        elif score >= 65:
            return 'C'
        elif score >= 60:
            return 'D+'
        elif score >= 50:
            return 'D'
        else:
            return 'F'
