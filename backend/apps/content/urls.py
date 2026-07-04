from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LectureViewSet, AssignmentViewSet

router = DefaultRouter()
router.register('lectures', LectureViewSet, basename='lecture')
router.register('assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
]
