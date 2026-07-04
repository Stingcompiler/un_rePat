from rest_framework import permissions
from .models import UserRole


class IsSystemManager(permissions.BasePermission):
    """Allow access only to system managers."""
    message = 'هذا الإجراء مخصص لمدير النظام فقط'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.SYSTEM_MANAGER


class IsSupervisor(permissions.BasePermission):
    """Allow access only to supervisors."""
    message = 'هذا الإجراء مخصص للمشرفين فقط'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.SUPERVISOR


class IsTeacher(permissions.BasePermission):
    """Allow access only to teachers."""
    message = 'هذا الإجراء مخصص للأساتذة فقط'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.TEACHER


class IsTeachingAssistant(permissions.BasePermission):
    """Allow access only to teaching assistants."""
    message = 'هذا الإجراء مخصص للمعيدين فقط'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.TEACHING_ASSISTANT


class IsStudent(permissions.BasePermission):
    """Allow access only to students."""
    message = 'هذا الإجراء مخصص للطلاب فقط'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.STUDENT


class IsTeacherOrTA(permissions.BasePermission):
    """Allow access to teachers or teaching assistants."""
    message = 'هذا الإجراء مخصص للأساتذة أو المعيدين فقط'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.TEACHER, UserRole.TEACHING_ASSISTANT
        ]


class IsInstructorOfCourse(permissions.BasePermission):
    """Check if user is an instructor of the course."""
    message = 'أنت غير مسجل كمدرس لهذه المادة'
    
    def has_object_permission(self, request, view, obj):
        from apps.academic.models import CourseInstructor
        course = getattr(obj, 'course', obj)
        return CourseInstructor.objects.filter(
            course=course,
            instructor=request.user
        ).exists()


class CanManageDepartment(permissions.BasePermission):
    """Check if user can manage a department (system manager or department supervisor)."""
    message = 'ليس لديك صلاحية إدارة هذا القسم'
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.SYSTEM_MANAGER:
            return True
        if request.user.role == UserRole.SUPERVISOR:
            return obj.supervisor == request.user
        return False
