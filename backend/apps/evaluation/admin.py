from django.contrib import admin
from .models import Submission, CourseResult


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'student', 'submitted_at', 'score', 'graded_by', 'graded_at']
    list_filter = ['assignment__course__department', 'graded_at']
    search_fields = ['student__full_name_ar', 'student__university_number', 'assignment__title_ar']
    raw_id_fields = ['assignment', 'student', 'graded_by']
    readonly_fields = ['submitted_at']


@admin.register(CourseResult)
class CourseResultAdmin(admin.ModelAdmin):
    list_display = ['course', 'student', 'final_score', 'grade', 'is_published', 'published_by']
    list_filter = ['course__department', 'grade', 'is_published']
    search_fields = ['student__full_name_ar', 'student__university_number', 'course__code']
    raw_id_fields = ['course', 'student', 'published_by']
