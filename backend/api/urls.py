from django.urls import path
from .views import test, get_weather_suggestions, get_activity_suggestion

urlpatterns = [
    path('test/', test, name='test'),
    path('suggestions/', get_weather_suggestions, name='get_weather_suggestions'),
    path('activity-suggestion/', get_activity_suggestion, name='get_activity_suggestion'),

]