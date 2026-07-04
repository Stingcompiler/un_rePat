from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Lecture, Assignment
from .serializers import (
    LectureSerializer, LectureStudentSerializer,
    AssignmentSerializer, AssignmentStudentSerializer
)
from apps.accounts.permissions import IsTeacherOrTA, IsInstructorOfCourse
from apps.accounts.models import UserRole
from apps.academic.models import CourseInstructor


class LectureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing lectures."""
    serializer_class = LectureSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title_ar', 'title_en']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Lecture.objects.all()
        
        # Students only see published lectures for their courses
        if user.role == UserRole.STUDENT:
            queryset = queryset.filter(
                is_published=True,
                course__department=user.department,
                course__academic_year=user.academic_year,
                course__is_deleted=False
            )
        # Teachers/TAs see lectures for their assigned courses
        elif user.role in [UserRole.TEACHER, UserRole.TEACHING_ASSISTANT]:
            assigned_courses = CourseInstructor.objects.filter(
                instructor=user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(course_id__in=assigned_courses)
        # Supervisors see lectures for their department
        elif user.role == UserRole.SUPERVISOR and hasattr(user, 'supervised_department'):
             queryset = queryset.filter(course__department=user.supervised_department)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.select_related('course', 'created_by')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsTeacherOrTA()]
    
    def get_serializer_class(self):
        if self.request.user.role == UserRole.STUDENT:
            return LectureStudentSerializer
        return LectureSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        
        # Verify instructor is assigned to this course
        if not CourseInstructor.objects.filter(course=course, instructor=user).exists():
            raise serializers.ValidationError('أنت غير مسجل كمدرس لهذه المادة')
        
        # Teachers create theory, TAs create lab
        lecture_type = serializer.validated_data.get('lecture_type')
        if user.role == UserRole.TEACHER and lecture_type == 'lab':
            raise serializers.ValidationError('الأساتذة يمكنهم إنشاء المحاضرات النظرية فقط')
        if user.role == UserRole.TEACHING_ASSISTANT and lecture_type == 'theory':
            raise serializers.ValidationError('المعيدون يمكنهم إنشاء المحاضرات العملية فقط')
        
        serializer.save(created_by=user)


class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing assignments."""
    serializer_class = AssignmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title_ar', 'title_en']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Assignment.objects.all()
        
        # Students only see published assignments for their courses
        if user.role == UserRole.STUDENT:
            queryset = queryset.filter(
                is_published=True,
                course__department=user.department,
                course__academic_year=user.academic_year,
                course__is_deleted=False
            )
        # Teachers/TAs see assignments for their assigned courses
        elif user.role in [UserRole.TEACHER, UserRole.TEACHING_ASSISTANT]:
            assigned_courses = CourseInstructor.objects.filter(
                instructor=user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(course_id__in=assigned_courses)
        # Supervisors see assignments for their department
        elif user.role == UserRole.SUPERVISOR and hasattr(user, 'supervised_department'):
             queryset = queryset.filter(course__department=user.supervised_department)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.select_related('course', 'created_by')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsTeacherOrTA()]
    
    def get_serializer_class(self):
        if self.request.user.role == UserRole.STUDENT:
            return AssignmentStudentSerializer
        return AssignmentSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        course = serializer.validated_data['course']
        
        # Verify instructor is assigned to this course
        if not CourseInstructor.objects.filter(course=course, instructor=user).exists():
            raise serializers.ValidationError('أنت غير مسجل كمدرس لهذه المادة')
        
        # Teachers create theory, TAs create lab
        assignment_type = serializer.validated_data.get('assignment_type')
        if user.role == UserRole.TEACHER and assignment_type == 'lab':
            raise serializers.ValidationError('الأساتذة يمكنهم إنشاء الواجبات النظرية فقط')
        if user.role == UserRole.TEACHING_ASSISTANT and assignment_type == 'theory':
            raise serializers.ValidationError('المعيدون يمكنهم إنشاء الواجبات العملية فقط')
        
        serializer.save(created_by=user)
