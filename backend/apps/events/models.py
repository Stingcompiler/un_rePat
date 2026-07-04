from django.db import models


class Event(models.Model):
    """University event."""
    title_ar = models.CharField(max_length=300, verbose_name='العنوان بالعربية')
    title_en = models.CharField(max_length=300, blank=True, verbose_name='Title')
    description_ar = models.TextField(verbose_name='الوصف بالعربية')
    description_en = models.TextField(blank=True, verbose_name='Description')
    date = models.DateTimeField(verbose_name='تاريخ الفعالية')
    location = models.CharField(max_length=300, blank=True, verbose_name='الموقع')
    image = models.ImageField(
        upload_to='events/',
        blank=True,
        null=True,
        verbose_name='الصورة'
    )
    is_published = models.BooleanField(default=False, verbose_name='منشور')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'فعالية'
        verbose_name_plural = 'الفعاليات'
        ordering = ['-date']
    
    def __str__(self):
        return self.title_ar
