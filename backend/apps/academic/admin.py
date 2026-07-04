from django.contrib import admin
from .models import Department, AcademicYear, Course, CourseInstructor


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'name_en', 'supervisor', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name_ar', 'name_en']
    raw_id_fields = ['supervisor']


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['year', 'name_ar', 'is_current']
    list_filter = ['is_current']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name_ar', 'department', 'academic_year', 'credits', 'has_lab', 'is_deleted']
    list_filter = ['department', 'academic_year', 'has_lab', 'is_deleted']
    search_fields = ['code', 'name_ar', 'name_en']
    raw_id_fields = ['department']


@admin.register(CourseInstructor)
class CourseInstructorAdmin(admin.ModelAdmin):
    list_display = ['course', 'instructor', 'role', 'assigned_at']
    list_filter = ['role', 'course__department']
    search_fields = ['course__name_ar', 'instructor__full_name_ar']
    raw_id_fields = ['course', 'instructor']
