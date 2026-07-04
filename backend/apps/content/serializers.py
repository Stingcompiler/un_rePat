from rest_framework import serializers
from .models import Lecture, Assignment


class LectureSerializer(serializers.ModelSerializer):
    """Serializer for Lecture model."""
    course_name = serializers.CharField(source='course.name_ar', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name_ar', read_only=True)
    type_display = serializers.CharField(source='get_lecture_type_display', read_only=True)
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'course', 'course_name', 'course_code',
            'title_ar', 'title_en', 'content', 'lecture_type', 'type_display',
            'file', 'order', 'created_by', 'created_by_name',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class LectureStudentSerializer(serializers.ModelSerializer):
    """Serializer for lectures visible to students."""
    type_display = serializers.CharField(source='get_lecture_type_display', read_only=True)
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'title_ar', 'title_en', 'content', 'lecture_type',
            'type_display', 'file', 'order', 'created_at'
        ]


class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for Assignment model."""
    course_name = serializers.CharField(source='course.name_ar', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name_ar', read_only=True)
    type_display = serializers.CharField(source='get_assignment_type_display', read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'course_name', 'course_code',
            'title_ar', 'title_en', 'description', 'assignment_type', 'type_display',
            'file', 'max_score', 'due_date', 'created_by', 'created_by_name',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class AssignmentStudentSerializer(serializers.ModelSerializer):
    """Serializer for assignments visible to students."""
    type_display = serializers.CharField(source='get_assignment_type_display', read_only=True)
    submission_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title_ar', 'title_en', 'description', 'assignment_type',
            'type_display', 'file', 'max_score', 'due_date', 'submission_status'
        ]
    
    def get_submission_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.evaluation.models import Submission
            submission = Submission.objects.filter(
                assignment=obj, student=request.user
            ).first()
            if submission:
                return {
                    'submitted': True,
                    'score': submission.score,
                    'graded': submission.score is not None
                }
        return {'submitted': False, 'score': None, 'graded': False}
