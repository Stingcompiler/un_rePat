from rest_framework import serializers
from .models import Department, AcademicYear, Course, CourseInstructor


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""
    supervisor_name = serializers.CharField(source='supervisor.full_name_ar', read_only=True)
    courses_count = serializers.SerializerMethodField()
    students_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = [
            'id', 'name_ar', 'name_en', 'description_ar', 'description_en',
            'image', 'supervisor', 'supervisor_name', 'is_active',
            'courses_count', 'students_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_courses_count(self, obj):
        return obj.courses.filter(is_deleted=False).count()
    
    def get_students_count(self, obj):
        return obj.students.count()


class DepartmentPublicSerializer(serializers.ModelSerializer):
    """Public serializer for departments (no sensitive data)."""
    
    class Meta:
        model = Department
        fields = ['id', 'name_ar', 'name_en', 'description_ar', 'description_en', 'image']


class AcademicYearSerializer(serializers.ModelSerializer):
    """Serializer for AcademicYear model."""
    
    class Meta:
        model = AcademicYear
        fields = ['id', 'year', 'name_ar', 'name_en', 'is_current']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model."""
    department_name = serializers.CharField(source='department.name_ar', read_only=True)
    instructors_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'code', 'name_ar', 'name_en', 'description_ar', 'description_en',
            'department', 'department_name', 'academic_year', 'semester', 'credits',
            'has_lab', 'is_deleted', 'instructors_list', 'created_at'
        ]
        read_only_fields = ['id', 'is_deleted', 'created_at']
    
    def get_instructors_list(self, obj):
        return CourseInstructorSerializer(obj.instructors.all(), many=True).data


class CourseStudentSerializer(serializers.ModelSerializer):
    """Serializer for courses visible to students."""
    department_name = serializers.CharField(source='department.name_ar', read_only=True)
    teachers = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'code', 'name_ar', 'name_en', 'description_ar',
            'department_name', 'semester', 'credits', 'has_lab', 'teachers'
        ]
    
    def get_teachers(self, obj):
        teachers = obj.instructors.filter(role='teacher')
        return [{'name': t.instructor.full_name_ar} for t in teachers]


class CourseInstructorSerializer(serializers.ModelSerializer):
    """Serializer for CourseInstructor model."""
    instructor_name = serializers.CharField(source='instructor.full_name_ar', read_only=True)
    course_name = serializers.CharField(source='course.name_ar', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CourseInstructor
        fields = [
            'id', 'course', 'course_name', 'instructor', 'instructor_name',
            'role', 'role_display', 'assigned_at'
        ]
        read_only_fields = ['id', 'assigned_at']
