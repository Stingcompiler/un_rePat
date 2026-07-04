from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Full serializer for Event model."""
    
    class Meta:
        model = Event
        fields = [
            'id', 'title_ar', 'title_en', 'description_ar', 'description_en',
            'date', 'location', 'image', 'is_published', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EventPublicSerializer(serializers.ModelSerializer):
    """Public serializer for events (only published)."""
    
    class Meta:
        model = Event
        fields = [
            'id', 'title_ar', 'title_en', 'description_ar', 'description_en',
            'date', 'location', 'image'
        ]
