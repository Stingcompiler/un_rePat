from rest_framework import serializers
from .models import PageContent, ContactInfo, HeroSlide


class PageContentSerializer(serializers.ModelSerializer):
    """Serializer for PageContent model."""
    page_display = serializers.CharField(source='get_page_display', read_only=True)
    
    class Meta:
        model = PageContent
        fields = [
            'id', 'page', 'page_display', 'title_ar', 'title_en',
            'content_ar', 'content_en', 'updated_at'
        ]


class ContactInfoSerializer(serializers.ModelSerializer):
    """Serializer for ContactInfo model."""
    
    class Meta:
        model = ContactInfo
        fields = [
            'phone', 'email', 'address_ar', 'address_en',
            'facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp', 'map_embed'
        ]


class HeroSlideSerializer(serializers.ModelSerializer):
    """Serializer for HeroSlide model."""
    
    class Meta:
        model = HeroSlide
        fields = [
            'id', 'title_ar', 'title_en', 'subtitle_ar', 'subtitle_en',
            'image', 'button_text_ar', 'button_text_en', 'button_link', 'order'
        ]
