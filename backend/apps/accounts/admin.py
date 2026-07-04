from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UniversityStudent


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'full_name_ar', 'role', 'department', 'academic_year', 'is_active']
    list_filter = ['role', 'department', 'academic_year', 'is_active']
    search_fields = ['username', 'email', 'full_name_ar', 'full_name_en', 'university_number']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('معلومات إضافية', {
            'fields': ('role', 'full_name_ar', 'full_name_en', 'phone', 
                      'department', 'academic_year', 'university_number')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('معلومات إضافية', {
            'fields': ('role', 'full_name_ar', 'full_name_en', 'phone',
                      'department', 'academic_year', 'university_number')
        }),
    )


@admin.register(UniversityStudent)
class UniversityStudentAdmin(admin.ModelAdmin):
    list_display = ['university_number', 'full_name_ar', 'department', 'academic_year', 'is_registered']
    list_filter = ['department', 'academic_year', 'is_registered']
    search_fields = ['university_number', 'full_name_ar', 'full_name_en']
    ordering = ['university_number']
