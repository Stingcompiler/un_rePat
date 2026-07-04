from rest_framework import viewsets, status, filters, serializers
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Department, AcademicYear, Course, CourseInstructor
from .serializers import (
    DepartmentSerializer, DepartmentPublicSerializer,
    AcademicYearSerializer, CourseSerializer, 
    CourseStudentSerializer, CourseInstructorSerializer
)
from apps.accounts.permissions import (
    IsSystemManager, IsSupervisor, CanManageDepartment,
    IsTeacherOrTA, IsStudent
)
from apps.accounts.models import UserRole, User
from apps.content.models import Assignment, Lecture
from apps.evaluation.models import Submission
from django.utils import timezone


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing departments."""
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name_ar', 'name_en']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsSystemManager()]
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve'] and not self.request.user.is_authenticated:
            return DepartmentPublicSerializer
        return DepartmentSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsSystemManager])
    def assign_supervisor(self, request, pk=None):
        """Assign a supervisor to a department."""
        department = self.get_object()
        supervisor_id = request.data.get('supervisor_id')
        
        if not supervisor_id:
            return Response(
                {'error': 'يجب تحديد المشرف'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        try:
            supervisor = User.objects.get(id=supervisor_id, role=UserRole.SUPERVISOR)
        except User.DoesNotExist:
            return Response(
                {'error': 'المشرف غير موجود أو ليس له صلاحية الإشراف'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if supervisor already manages another department
        if hasattr(supervisor, 'supervised_department') and supervisor.supervised_department != department:
            return Response(
                {'error': 'هذا المشرف يدير قسماً آخر بالفعل'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        department.supervisor = supervisor
        department.save()
        
        return Response({
            'message': 'تم تعيين المشرف بنجاح',
            'department': DepartmentSerializer(department).data
        })


class AcademicYearViewSet(viewsets.ModelViewSet):
    """ViewSet for managing academic years."""
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsSystemManager()]


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing courses."""
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['code', 'name_ar', 'name_en']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Course.objects.filter(is_deleted=False)
        
        # Filter by department and year for students
        if user.is_authenticated and user.role == UserRole.STUDENT:
            queryset = queryset.filter(
                department=user.department,
                academic_year=user.academic_year
            )
        
        # Filter by department for Supervisors
        if user.is_authenticated and user.role == UserRole.SUPERVISOR:
            # Assuming Supervisor model has a way to link to department, e.g., supervised_department
            # Based on previous context, user.supervised_department is a OneToOneField
            if hasattr(user, 'supervised_department') and user.supervised_department:
                 queryset = queryset.filter(department=user.supervised_department)
        
        # Filter by query params
        department_id = self.request.query_params.get('department')
        academic_year = self.request.query_params.get('academic_year')
        
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        
        return queryset.select_related('department')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSupervisor()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.request.user.role == UserRole.STUDENT:
            return CourseStudentSerializer
        return CourseSerializer
    
    def perform_create(self, serializer):
        user = self.request.user
        # Supervisor can only create courses for their department
        if user.role == UserRole.SUPERVISOR:
            try:
                if user.supervised_department:
                    serializer.save(department=user.supervised_department)
                else:
                     raise serializers.ValidationError({'non_field_errors': ['أنت لست مشرفاً على أي قسم']})
            except Exception:
                raise serializers.ValidationError({'non_field_errors': ['أنت لست مشرفاً على أي قسم']})
        else:
            serializer.save()
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.is_deleted = True
        instance.save()
    
    @action(detail=False, methods=['get'], permission_classes=[IsTeacherOrTA])
    def my_courses(self, request):
        """Get courses assigned to the current teacher/TA."""
        assignments = CourseInstructor.objects.filter(
            instructor=request.user
        ).select_related('course', 'course__department')
        
        courses = [a.course for a in assignments if not a.course.is_deleted]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


class CourseInstructorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing course instructor assignments."""
    queryset = CourseInstructor.objects.all()
    serializer_class = CourseInstructorSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSupervisor() | IsSystemManager()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset.select_related('course', 'instructor')


class DashboardStatsView(APIView):
    """Get dashboard statistics based on user role."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {}

        if user.role == UserRole.STUDENT:
            # 1. Registered Courses
            courses_count = Course.objects.filter(
                department=user.department,
                academic_year=user.academic_year,
                is_deleted=False
            ).count()
            
            # 2. Upcoming Assignments (Not submitted, due in future)
            upcoming_assignments = Assignment.objects.filter(
                course__department=user.department,
                course__academic_year=user.academic_year,
                is_published=True,
                due_date__gte=timezone.now()
            ).exclude(submissions__student=user).count()
            
            # 3. Submitted Assignments
            submitted_count = Submission.objects.filter(student=user).count()
            
            # 4. Alerts (Mock for now or check unread notifications if exists)
            alerts_count = 0 

            data = {
                'courses_count': courses_count,
                'upcoming_assignments': upcoming_assignments,
                'submitted_count': submitted_count,
                'alerts_count': alerts_count
            }

        elif user.role in [UserRole.TEACHER, UserRole.TEACHING_ASSISTANT]:
            # 1. Active Courses assigned to this instructor
            active_courses = Course.objects.filter(
                instructors__instructor=user,
                is_deleted=False
            ).distinct().count()
            
            # 2. Total Students in his courses
            # Students belonging to the dept/year of the courses this instructor teaches
            # This is an approximation. A more precise way depends on if students register for Specific Sections.
            # Assuming cohort based:
            taught_courses = Course.objects.filter(instructors__instructor=user)
            total_students = User.objects.filter(
                role=UserRole.STUDENT,
                department__courses__in=taught_courses,
                academic_year__in=taught_courses.values('academic_year')
            ).distinct().count()

            # 3. Ungraded Submissions
            # Submissions for assignments in my courses that are not graded
            ungraded_count = Submission.objects.filter(
                assignment__course__instructors__instructor=user,
                score__isnull=True
            ).count()

            # 4. Lectures (My lectures)
            lectures_count = Lecture.objects.filter(created_by=user).count()

            data = {
                'active_courses': active_courses,
                'total_students': total_students,
                'ungraded_count': ungraded_count,
                'lectures_count': lectures_count
            }
        
        elif user.role in [UserRole.SUPERVISOR, UserRole.SYSTEM_MANAGER]:
             # Supervisors see stats for their department
             if user.role == UserRole.SUPERVISOR and hasattr(user, 'supervised_department'):
                 dept = user.supervised_department
                 active_courses = Course.objects.filter(department=dept, is_deleted=False).count()
                 total_students = User.objects.filter(department=dept, role=UserRole.STUDENT).count()
                 # Assignments created in this dept
                 created_assignments = Assignment.objects.filter(course__department=dept).count()
                 # Instructors in this dept
                 total_instructors = CourseInstructor.objects.filter(course__department=dept).values('instructor').distinct().count()
                 
                 data = {
                     'active_courses': active_courses,
                     'total_students': total_students,
                     'created_assignments': created_assignments,
                     'total_instructors': total_instructors
                 }
             else:
                 # System Manager sees global stats
                 active_courses = Course.objects.filter(is_deleted=False).count()
                 total_students = User.objects.filter(role=UserRole.STUDENT).count()
                 total_departments = Department.objects.count()
                 total_users = User.objects.count()
                 
                 data = {
                     'active_courses': active_courses,
                     'total_students': total_students,
                     'total_departments': total_departments,
                     'total_users': total_users
                 }

        return Response(data)
