from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UniversityStudent

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    department_name = serializers.CharField(source='department.name_ar', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'role_display',
            'full_name_ar', 'full_name_en', 'phone',
            'department', 'department_name', 'academic_year',
            'university_number', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'role']


class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for User management by admins."""
    department_name = serializers.CharField(source='department.name_ar', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'role_display',
            'full_name_ar', 'full_name_en', 'phone',
            'department', 'department_name', 'academic_year',
            'university_number', 'is_active', 'created_at',  'password'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class StudentRegistrationSerializer(serializers.Serializer):
    """Serializer for student registration with university number validation."""
    university_number = serializers.CharField(max_length=50)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate_university_number(self, value):
        """Validate that university number exists and is not already registered."""
        try:
            student = UniversityStudent.objects.get(university_number=value)
            if student.is_registered:
                raise serializers.ValidationError('هذا الرقم الجامعي مسجل بالفعل في النظام')
            return value
        except UniversityStudent.DoesNotExist:
            raise serializers.ValidationError('الرقم الجامعي غير موجود في سجلات الجامعة')
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('اسم المستخدم موجود بالفعل')
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('البريد الإلكتروني مسجل بالفعل')
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'كلمتا المرور غير متطابقتين'})
        return attrs
    
    def create(self, validated_data):
        university_number = validated_data['university_number']
        uni_student = UniversityStudent.objects.get(university_number=university_number)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name_ar=uni_student.full_name_ar,
            full_name_en=uni_student.full_name_en,
            phone=validated_data.get('phone', ''),
            role='student',
            department=uni_student.department,
            academic_year=uni_student.academic_year,
            university_number=university_number
        )
        
        # Mark as registered
        uni_student.is_registered = True
        uni_student.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'كلمتا المرور غير متطابقتين'})
        return attrs


class UniversityStudentSerializer(serializers.ModelSerializer):
    """Serializer for UniversityStudent registry."""
    department_name = serializers.CharField(source='department.name_ar', read_only=True)
    
    class Meta:
        model = UniversityStudent
        fields = [
            'id', 'university_number', 'full_name_ar', 'full_name_en',
            'department', 'department_name', 'academic_year', 'is_registered'
        ]
