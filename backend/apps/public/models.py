from django.db import models


class PageContent(models.Model):
    """Dynamic content for public pages."""
    PAGE_CHOICES = [
        ('home', 'الصفحة الرئيسية'),
        ('about', 'عن الكلية'),
        ('contact', 'اتصل بنا'),
        ('policies', 'السياسات'),
    ]
    
    page = models.CharField(max_length=20, choices=PAGE_CHOICES, unique=True, verbose_name='الصفحة')
    title_ar = models.CharField(max_length=300, verbose_name='العنوان بالعربية')
    title_en = models.CharField(max_length=300, blank=True, verbose_name='Title')
    content_ar = models.TextField(verbose_name='المحتوى بالعربية')
    content_en = models.TextField(blank=True, verbose_name='Content')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'محتوى صفحة'
        verbose_name_plural = 'محتويات الصفحات'
    
    def __str__(self):
        return self.get_page_display()


class ContactInfo(models.Model):
    """University contact information."""
    phone = models.CharField(max_length=50, verbose_name='الهاتف')
    email = models.EmailField(verbose_name='البريد الإلكتروني')
    address_ar = models.TextField(verbose_name='العنوان بالعربية')
    address_en = models.TextField(blank=True, verbose_name='Address')
    facebook = models.URLField(blank=True, verbose_name='فيسبوك')
    twitter = models.URLField(blank=True, verbose_name='تويتر')
    instagram = models.URLField(blank=True, verbose_name='انستغرام')
    linkedin = models.URLField(blank=True, verbose_name='لينكد إن')
    whatsapp = models.CharField(max_length=50, blank=True, verbose_name='واتساب')
    map_embed = models.TextField(blank=True, verbose_name='رابط خريطة جوجل')
    
    class Meta:
        verbose_name = 'معلومات الاتصال'
        verbose_name_plural = 'معلومات الاتصال'
    
    def __str__(self):
        return 'معلومات الاتصال'
    
    def save(self, *args, **kwargs):
        # Only one instance allowed
        self.pk = 1
        super().save(*args, **kwargs)


class HeroSlide(models.Model):
    """Hero section slides for landing page."""
    title_ar = models.CharField(max_length=300, verbose_name='العنوان بالعربية')
    title_en = models.CharField(max_length=300, blank=True, verbose_name='Title')
    subtitle_ar = models.CharField(max_length=500, blank=True, verbose_name='العنوان الفرعي بالعربية')
    subtitle_en = models.CharField(max_length=500, blank=True, verbose_name='Subtitle')
    image = models.ImageField(upload_to='hero/', verbose_name='الصورة')
    button_text_ar = models.CharField(max_length=100, blank=True, verbose_name='نص الزر بالعربية')
    button_text_en = models.CharField(max_length=100, blank=True, verbose_name='Button Text')
    button_link = models.CharField(max_length=200, blank=True, verbose_name='رابط الزر')
    order = models.PositiveIntegerField(default=1, verbose_name='الترتيب')
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    
    class Meta:
        verbose_name = 'شريحة الهيرو'
        verbose_name_plural = 'شرائح الهيرو'
        ordering = ['order']
    
    def __str__(self):
        return self.title_ar
