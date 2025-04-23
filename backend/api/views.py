from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@api_view(['GET'])
def test(request):
    return Response({'message': 'API is working'})


OPENWEATHERMAP_API_KEY = 'your_openweathermap_api_key'

@csrf_exempt
def get_weather_suggestions(request):
    if request.method == 'POST':
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        # Check cache for weather data
        cache_key = f'weather_{latitude}_{longitude}'
        weather_data = cache.get(cache_key)

        if not weather_data:
            # Fetch weather data from OpenWeatherMap API
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
            response = requests.get(url)
            if response.status_code == 200:
                weather_data = response.json()
                # Cache the result for 15 minutes (900 seconds)
                cache.set(cache_key, weather_data, 900)
            else:
                return JsonResponse({'error': 'Failed to fetch weather data'}, status=500)

        return JsonResponse(weather_data)
    return JsonResponse({'error': 'Invalid request method'}, status=400)