from django.urls import path
from .views import test, get_weather_suggestions, get_activity_suggestion, get_place_details, update_user_preference, get_user_preferences, delete_user_preference

urlpatterns = [
    path('test/', test, name='test'),
    path('suggestions/', get_weather_suggestions, name='get_weather_suggestions'),
    path('activity-suggestion/', get_activity_suggestion, name='get_activity_suggestion'),
    path('place-details/<str:place_id>/', get_place_details, name='get_place_details'),
    path('user-preference/', update_user_preference, name='update_user_preference'),
    path('user-preferences/', get_user_preferences, name='get_user_preferences'),
    path('user-preference/<str:place_id>/', delete_user_preference, name='delete_user_preference'),
]