from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import PageContent, ContactInfo, HeroSlide
from .serializers import PageContentSerializer, ContactInfoSerializer, HeroSlideSerializer
from apps.academic.models import Department
from apps.academic.serializers import DepartmentPublicSerializer
from apps.events.models import Event
from apps.events.serializers import EventPublicSerializer


class PageContentView(generics.RetrieveAPIView):
    """Get content for a specific page."""
    permission_classes = [AllowAny]
    serializer_class = PageContentSerializer
    lookup_field = 'page'
    queryset = PageContent.objects.all()


class ContactInfoView(APIView):
    """Get contact information."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        contact = ContactInfo.objects.first()
        if contact:
            return Response(ContactInfoSerializer(contact).data)
        return Response({})


class HeroSlidesView(generics.ListAPIView):
    """Get active hero slides."""
    permission_classes = [AllowAny]
    serializer_class = HeroSlideSerializer
    queryset = HeroSlide.objects.filter(is_active=True)


class LandingDataView(APIView):
    """Get all data for landing page in one request."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Hero slides
        hero_slides = HeroSlide.objects.filter(is_active=True)
        
        # Departments (active only)
        departments = Department.objects.filter(is_active=True)[:6]
        
        # Upcoming events (published only)
        from django.utils import timezone
        events = Event.objects.filter(
            is_published=True,
            date__gte=timezone.now()
        )[:4]
        
        # Contact info
        contact = ContactInfo.objects.first()
        
        # About content
        about = PageContent.objects.filter(page='about').first()
        
        return Response({
            'hero_slides': HeroSlideSerializer(hero_slides, many=True).data,
            'departments': DepartmentPublicSerializer(departments, many=True).data,
            'events': EventPublicSerializer(events, many=True).data,
            'contact': ContactInfoSerializer(contact).data if contact else None,
            'about': PageContentSerializer(about).data if about else None,
        })
