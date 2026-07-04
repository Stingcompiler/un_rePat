from django.urls import path
from .views import (
    StudentRegistrationView, LoginView, LogoutView,
    RefreshTokenView, UserProfileView, ChangePasswordView,
    CSRFTokenView, CheckAuthView
)

urlpatterns = [
    path('register/', StudentRegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('csrf/', CSRFTokenView.as_view(), name='csrf_token'),
    path('check/', CheckAuthView.as_view(), name='check_auth'),
]

from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns += router.urls
