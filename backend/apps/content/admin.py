from django.contrib import admin
from .models import Lecture, Assignment


@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ['course', 'title_ar', 'lecture_type', 'order', 'is_published', 'created_by']
    list_filter = ['lecture_type', 'is_published', 'course__department']
    search_fields = ['title_ar', 'title_en', 'course__code']
    raw_id_fields = ['course', 'created_by']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['course', 'title_ar', 'assignment_type', 'max_score', 'due_date', 'is_published']
    list_filter = ['assignment_type', 'is_published', 'course__department']
    search_fields = ['title_ar', 'title_en', 'course__code']
    raw_id_fields = ['course', 'created_by']
