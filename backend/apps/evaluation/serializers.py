from rest_framework import serializers
from django.utils import timezone
from .models import Submission, CourseResult


class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for Submission model."""
    assignment_title = serializers.CharField(source='assignment.title_ar', read_only=True)
    student_name = serializers.CharField(source='student.full_name_ar', read_only=True)
    student_number = serializers.CharField(source='student.university_number', read_only=True)
    grader_name = serializers.CharField(source='graded_by.full_name_ar', read_only=True)
    max_score = serializers.DecimalField(
        source='assignment.max_score',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'student_number', 'file', 'notes', 'submitted_at',
            'score', 'max_score', 'feedback', 'graded_by', 'grader_name', 'graded_at'
        ]
        read_only_fields = [
            'id', 'student', 'submitted_at', 'graded_by', 'graded_at'
        ]


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating submissions (student)."""
    
    class Meta:
        model = Submission
        fields = ['assignment', 'file', 'notes']
    
    def validate_assignment(self, value):
        if not value.is_published:
            raise serializers.ValidationError('هذا الواجب غير متاح للتسليم')
        if value.due_date < timezone.now():
            raise serializers.ValidationError('انتهى موعد تسليم هذا الواجب')
        return value
    
    def validate(self, attrs):
        request = self.context.get('request')
        assignment = attrs.get('assignment')
        
        # Check if student already submitted
        if Submission.objects.filter(assignment=assignment, student=request.user).exists():
            raise serializers.ValidationError('لقد قمت بتسليم هذا الواجب بالفعل')
        
        return attrs


class SubmissionGradeSerializer(serializers.Serializer):
    """Serializer for grading a submission."""
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
    feedback = serializers.CharField(required=False, allow_blank=True)
    
    def validate_score(self, value):
        if value < 0:
            raise serializers.ValidationError('الدرجة يجب أن تكون صفر أو أكثر')
        return value


class CourseResultSerializer(serializers.ModelSerializer):
    """Serializer for CourseResult model."""
    course_name = serializers.CharField(source='course.name_ar', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    student_name = serializers.CharField(source='student.full_name_ar', read_only=True)
    student_number = serializers.CharField(source='student.university_number', read_only=True)
    publisher_name = serializers.CharField(source='published_by.full_name_ar', read_only=True)
    
    class Meta:
        model = CourseResult
        fields = [
            'id', 'course', 'course_name', 'course_code',
            'student', 'student_name', 'student_number',
            'final_score', 'grade', 'notes',
            'is_published', 'published_by', 'publisher_name', 'published_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'published_by', 'published_at', 'created_at', 'updated_at'
        ]


class CourseResultStudentSerializer(serializers.ModelSerializer):
    """Serializer for results visible to students."""
    course_name = serializers.CharField(source='course.name_ar', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = CourseResult
        fields = [
            'course_name', 'course_code', 'final_score', 'grade', 'published_at'
        ]
