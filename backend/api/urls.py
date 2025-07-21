from django.urls import path
from .views import test, get_weather_suggestions, get_activity_suggestion, record_user_interaction

urlpatterns = [
    path('test/', test, name='test'),
    path('suggestions/', get_weather_suggestions, name='get_weather_suggestions'),
    path('activity-suggestion/', get_activity_suggestion, name='get_activity_suggestion'),
    path('record-interaction/', record_user_interaction, name='record_user_interaction'),
]