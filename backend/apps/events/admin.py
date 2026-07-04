from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title_ar', 'date', 'location', 'is_published', 'created_at']
    list_filter = ['is_published', 'date']
    search_fields = ['title_ar', 'title_en']
    list_editable = ['is_published']
