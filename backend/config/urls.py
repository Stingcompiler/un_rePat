from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/academic/', include('apps.academic.urls')),
    path('api/content/', include('apps.content.urls')),
    path('api/evaluation/', include('apps.evaluation.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/public/', include('apps.public.urls')),
    # Catch-all: serve React SPA for every other URL
    re_path(r'^(?!api/|admin/|media/|static/).*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
