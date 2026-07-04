from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Submission, CourseResult
from .serializers import (
    SubmissionSerializer, SubmissionCreateSerializer, SubmissionGradeSerializer,
    CourseResultSerializer, CourseResultStudentSerializer
)
from apps.accounts.permissions import IsTeacherOrTA, IsTeacher, IsStudent
from apps.accounts.models import UserRole
from apps.academic.models import CourseInstructor


class SubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing submissions."""
    serializer_class = SubmissionSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Submission.objects.all()
        
        # Students see only their submissions
        if user.role == UserRole.STUDENT:
            queryset = queryset.filter(student=user)
        # Teachers/TAs see submissions for their courses
        elif user.role in [UserRole.TEACHER, UserRole.TEACHING_ASSISTANT]:
            assigned_courses = CourseInstructor.objects.filter(
                instructor=user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(assignment__course_id__in=assigned_courses)
        
        # Filter by assignment
        assignment_id = self.request.query_params.get('assignment')
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)
        
        return queryset.select_related(
            'assignment', 'assignment__course', 'student', 'graded_by'
        )
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        if self.action in ['grade', 'update', 'partial_update']:
            return [IsTeacherOrTA()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubmissionCreateSerializer
        return SubmissionSerializer
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrTA])
    def grade(self, request, pk=None):
        """Grade a submission."""
        submission = self.get_object()
        serializer = SubmissionGradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validate score against max_score
        score = serializer.validated_data['score']
        if score > submission.assignment.max_score:
            return Response(
                {'error': f'الدرجة لا يمكن أن تتجاوز {submission.assignment.max_score}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission.score = score
        submission.feedback = serializer.validated_data.get('feedback', '')
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.save()
        
        return Response({
            'message': 'تم التصحيح بنجاح',
            'submission': SubmissionSerializer(submission).data
        })


class CourseResultViewSet(viewsets.ModelViewSet):
    """ViewSet for managing course results."""
    serializer_class = CourseResultSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = CourseResult.objects.all()
        
        # Students see only their published results
        if user.role == UserRole.STUDENT:
            queryset = queryset.filter(student=user, is_published=True)
        # Teachers/TAs see results for their courses
        elif user.role in [UserRole.TEACHER, UserRole.TEACHING_ASSISTANT]:
            assigned_courses = CourseInstructor.objects.filter(
                instructor=user
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(course_id__in=assigned_courses)
        # Supervisors see results for their department
        elif user.role == UserRole.SUPERVISOR and hasattr(user, 'supervised_department'):
             queryset = queryset.filter(course__department=user.supervised_department)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.select_related('course', 'student', 'published_by')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action == 'publish':
            return [IsTeacher()]
        return [IsTeacherOrTA()]
    
    def get_serializer_class(self):
        if self.request.user.role == UserRole.STUDENT:
            return CourseResultStudentSerializer
        return CourseResultSerializer
    
    def perform_create(self, serializer):
        score = serializer.validated_data['final_score']
        grade = CourseResult.calculate_grade(float(score))
        serializer.save(grade=grade)
    
    def perform_update(self, serializer):
        score = serializer.validated_data.get('final_score')
        if score:
            grade = CourseResult.calculate_grade(float(score))
            serializer.save(grade=grade)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsTeacher])
    def publish(self, request, pk=None):
        """Publish a course result (teachers only)."""
        result = self.get_object()
        
        if result.is_published:
            return Response(
                {'error': 'هذه النتيجة منشورة بالفعل'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result.is_published = True
        result.published_by = request.user
        result.published_at = timezone.now()
        result.save()
        
        return Response({
            'message': 'تم نشر النتيجة بنجاح',
            'result': CourseResultSerializer(result).data
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsTeacher])
    def publish_all(self, request):
        """Publish all results for a course."""
        course_id = request.data.get('course_id')
        
        if not course_id:
            return Response(
                {'error': 'يجب تحديد المادة'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify teacher is assigned to this course
        if not CourseInstructor.objects.filter(
            course_id=course_id, instructor=request.user, role='teacher'
        ).exists():
            return Response(
                {'error': 'أنت غير مسجل كأستاذ لهذه المادة'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        count = CourseResult.objects.filter(
            course_id=course_id, is_published=False
        ).update(
            is_published=True,
            published_by=request.user,
            published_at=timezone.now()
        )
        
        return Response({
            'message': f'تم نشر {count} نتيجة بنجاح'
        })
