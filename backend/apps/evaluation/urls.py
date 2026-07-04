from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubmissionViewSet, CourseResultViewSet

router = DefaultRouter()
router.register('submissions', SubmissionViewSet, basename='submission')
router.register('results', CourseResultViewSet, basename='course-result')

urlpatterns = [
    path('', include(router.urls)),
]
