from django.contrib import admin
from .models import PageContent, ContactInfo, HeroSlide


@admin.register(PageContent)
class PageContentAdmin(admin.ModelAdmin):
    list_display = ['page', 'title_ar', 'updated_at']
    search_fields = ['title_ar', 'title_en']


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ['phone', 'email']
    
    def has_add_permission(self, request):
        # Only one instance allowed
        return not ContactInfo.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ['title_ar', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['title_ar', 'title_en']
