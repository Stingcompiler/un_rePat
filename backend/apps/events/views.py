from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.utils import timezone

from .models import Event
from .serializers import EventSerializer, EventPublicSerializer
from apps.accounts.permissions import IsSystemManager


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for managing events."""
    serializer_class = EventSerializer
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Public access only sees published future events
        if not self.request.user.is_authenticated or not self.request.user.is_system_manager:
            queryset = queryset.filter(is_published=True)
        
        # Filter for upcoming only
        upcoming = self.request.query_params.get('upcoming')
        if upcoming:
            queryset = queryset.filter(date__gte=timezone.now())
        
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsSystemManager()]
    
    def get_serializer_class(self):
        if not self.request.user.is_authenticated:
            return EventPublicSerializer
        if self.request.user.is_system_manager:
            return EventSerializer
        return EventPublicSerializer
