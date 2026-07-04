from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, AcademicYearViewSet, CourseViewSet, 
    CourseInstructorViewSet, DashboardStatsView
)

router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='department')
router.register('years', AcademicYearViewSet, basename='academic-year')
router.register('courses', CourseViewSet, basename='course')
router.register('instructors', CourseInstructorViewSet, basename='course-instructor')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard_stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
