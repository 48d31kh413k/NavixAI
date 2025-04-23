from django.urls import path
from .views import test, get_weather_suggestions

urlpatterns = [
    path('test/', test, name='test'),
    path('api/suggestions/', get_weather_suggestions, name='get_weather_suggestions'),

]