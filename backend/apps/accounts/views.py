from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.middleware.csrf import get_token

from .serializers import (
    UserSerializer, StudentRegistrationSerializer, 
    LoginSerializer, ChangePasswordSerializer
)

User = get_user_model()


def set_jwt_cookies(response, access_token, refresh_token):
    """Helper to set JWT tokens as HttpOnly cookies."""
    response.set_cookie(
        key=settings.JWT_AUTH_COOKIE,
        value=str(access_token),
        httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
        secure=settings.JWT_AUTH_COOKIE_SECURE,
        samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
        path=settings.JWT_AUTH_COOKIE_PATH,
    )
    response.set_cookie(
        key=settings.JWT_AUTH_REFRESH_COOKIE,
        value=str(refresh_token),
        httponly=settings.JWT_AUTH_COOKIE_HTTP_ONLY,
        secure=settings.JWT_AUTH_COOKIE_SECURE,
        samesite=settings.JWT_AUTH_COOKIE_SAMESITE,
        path=settings.JWT_AUTH_COOKIE_PATH,
    )
    return response


def clear_jwt_cookies(response):
    """Helper to clear JWT cookies on logout."""
    response.delete_cookie(settings.JWT_AUTH_COOKIE, path=settings.JWT_AUTH_COOKIE_PATH)
    response.delete_cookie(settings.JWT_AUTH_REFRESH_COOKIE, path=settings.JWT_AUTH_COOKIE_PATH)
    return response


class StudentRegistrationView(generics.CreateAPIView):
    """Register a new student by validating university number."""
    permission_classes = [AllowAny]
    serializer_class = StudentRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        response_data = {
            'message': 'تم التسجيل بنجاح',
            'user': UserSerializer(user).data
        }
        
        response = Response(response_data, status=status.HTTP_201_CREATED)
        return set_jwt_cookies(response, access, refresh)


class LoginView(APIView):
    """Login and receive JWT tokens in HttpOnly cookies."""
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if user is None:
            return Response(
                {'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'هذا الحساب غير مفعل'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        response_data = {
            'message': 'تم تسجيل الدخول بنجاح',
            'user': UserSerializer(user).data,
            'csrf_token': get_token(request)
        }
        
        response = Response(response_data, status=status.HTTP_200_OK)
        return set_jwt_cookies(response, access, refresh)


class LogoutView(APIView):
    """Logout and clear JWT cookies."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Blacklist the refresh token
            refresh_token = request.COOKIES.get(settings.JWT_AUTH_REFRESH_COOKIE)
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass  # Token already blacklisted or invalid
        
        response = Response({'message': 'تم تسجيل الخروج بنجاح'}, status=status.HTTP_200_OK)
        return clear_jwt_cookies(response)


class RefreshTokenView(APIView):
    """Refresh the access token using refresh token from cookie."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.JWT_AUTH_REFRESH_COOKIE)
        
        if not refresh_token:
            return Response(
                {'error': 'لم يتم العثور على رمز التحديث'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            access = refresh.access_token
            
            # Rotate refresh token
            refresh.blacklist()
            new_refresh = RefreshToken.for_user(
                User.objects.get(id=refresh.payload['user_id'])
            )
            
            response = Response({'message': 'تم تحديث الرمز بنجاح'}, status=status.HTTP_200_OK)
            return set_jwt_cookies(response, access, new_refresh)
            
        except TokenError:
            response = Response(
                {'error': 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            return clear_jwt_cookies(response)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the current user's password."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': 'كلمة المرور الحالية غير صحيحة'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Generate new tokens after password change
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        response = Response({'message': 'تم تغيير كلمة المرور بنجاح'}, status=status.HTTP_200_OK)
        return set_jwt_cookies(response, access, refresh)


class CSRFTokenView(APIView):
    """Get CSRF token for forms."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'csrf_token': get_token(request)})


class CheckAuthView(APIView):
    """Check if user is authenticated and return user data."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'authenticated': True,
            'user': UserSerializer(request.user).data
        })


from rest_framework import viewsets, filters
from apps.accounts.permissions import IsSystemManager
from .serializers import UserManagementSerializer

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users."""
    serializer_class = UserManagementSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'full_name_ar', 'full_name_en', 'university_number']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSystemManager()]
        
    def get_queryset(self):
        user = self.request.user
        from .models import UserRole
        if user.role == UserRole.SYSTEM_MANAGER:
            return User.objects.all().order_by('-date_joined')
        elif user.role == UserRole.SUPERVISOR and hasattr(user, 'supervised_department') and user.supervised_department:
            return User.objects.filter(department=user.supervised_department).order_by('-date_joined')
        elif user.role in [UserRole.TEACHER, UserRole.TEACHING_ASSISTANT]:
            # Teachers and TAs can see students
            return User.objects.filter(role=UserRole.STUDENT).order_by('-date_joined')
        return User.objects.none()

