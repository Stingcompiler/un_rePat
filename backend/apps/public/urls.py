from django.urls import path
from .views import (
    PageContentView, ContactInfoView, HeroSlidesView, LandingDataView
)

urlpatterns = [
    path('landing/', LandingDataView.as_view(), name='landing'),
    path('page/<str:page>/', PageContentView.as_view(), name='page-content'),
    path('contact/', ContactInfoView.as_view(), name='contact-info'),
    path('hero/', HeroSlidesView.as_view(), name='hero-slides'),
]
